const GoogleSheetClient = require('./../clients/googlesheets');
const { promisify } = require('util');

class googleSheetWriter{
    constructor(){
        this.width = 10;
        this.pointer = 1;
        this.chunk = 200;
        this.googleSheetClient = new GoogleSheetClient(process.env.GOOGLE_SHEETS_ID);
    }

    async init(){
        await this.googleSheetClient.auth(process.env.GOOGLE_SHEETS_USER, process.env.GOOGLE_SHEETS_PRIVATE_KEY);
        await this.reloadMetadata();
        return this;

    }

    async storeDay(day){
        let targetDate = new Date(day[0].start);
        let targetWorksheet = await this.getTargetWorksheet(targetDate);
        let getCellsPromise = promisify(targetWorksheet.getCells);

        await this.fastForwardPointer(targetWorksheet);

        let cells = await getCellsPromise({
            'min-row': this.pointer,
            'max-row': this.pointer + day.length,
            'min-col': 1,
            'max-col': this.width,
            'return-empty': true
        });


        for(let taskIndex = 0; day.length > taskIndex; taskIndex++){
            let task = day[taskIndex];
            let row = [
                task.date ||  "",
                task.client,
                task.description,
                task.duration,
                task.overtime || ""
            ]

            
            for(let cellIndex = 0; row.length > cellIndex; cellIndex++){
                cells[taskIndex * this.width + cellIndex].value = row[cellIndex]
            }
        }
        let storePromise = promisify(targetWorksheet.bulkUpdateCells);
        return await storePromise(cells)
    }

    async fastForwardPointer(targetWorksheet){
        this.pointer = 1;
        let lastKnownRowWithValue = 1;
        let currentRow = 1;
        let cells = [];
        for(currentRow; currentRow < lastKnownRowWithValue + 10; currentRow++){
            if(currentRow % this.chunk == 1){
                cells = await this.getNextSetOfRows(targetWorksheet, currentRow);
            }
            if (cells[currentRow % this.chunk].value !==  "") {
                lastKnownRowWithValue = currentRow;
            }
        }
        this.pointer = lastKnownRowWithValue + 3;        
    }

    async getNextSetOfRows(targetWorksheet, offset){
        let getCellsPromise = promisify(targetWorksheet.getCells);

        if(offset+this.chunk > targetWorksheet.rowCount){
            let targetWorksheetResizePromise = promisify(targetWorksheet.resize)
            await targetWorksheetResizePromise({rowCount: offset + this.chunk * 3, colCount: this.width})
        }

        let cells = await getCellsPromise({
            'min-row': offset,
            'max-row': offset + this.chunk,
            'min-col': 3,
            'max-col': 3,
            'return-empty': true
        });

        return cells;
    }

    async getTargetWorksheet(date){
        var sheetName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long'});
        let sheetToReturn = this.worksheets.find(function(sheet){
            return sheet.title === sheetName;
        })
        if (sheetToReturn === undefined){
            sheetToReturn = await this.googleSheetClient.addWorksheet(sheetName);
        }
        await this.reloadMetadata();
        return sheetToReturn;

    }

    async reloadMetadata(){
        this.metadata = await this.googleSheetClient.getMetadata();
        this.worksheets = this.metadata.worksheets;
    }
}
module.exports = googleSheetWriter
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

        console.log("Beginning fast foreward")
        await this.fastForwardPointer(targetWorksheet);
        console.log("Got past fast forewards")

        await targetWorksheet.loadCells({
            startRowIndex: Math.min(this.pointer - 1 , 0),
            endRowIndex: this.pointer + day.length,
            startColumnIndex: 0,
            endColumnIndex: this.width
        });

        console.log("Loading Day region:")
        console.log({
            startRowIndex: this.pointer,
            endRowIndex: this.pointer + day.length,
            startColumnIndex: 1,
            endColumnIndex: this.width
        })
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
                console.log([this.pointer + taskIndex, cellIndex])
                let cell = targetWorksheet.getCell(this.pointer + taskIndex, cellIndex)
                cell.value = row[cellIndex]
            }
        }

        await targetWorksheet.saveUpdatedCells()
        await targetWorksheet.resetLocalCache()
        await this.reloadMetadata()
    }

    async fastForwardPointer(targetWorksheet){
        this.pointer = 1;
        let lastKnownRowWithValue = 1;
        let currentRow = 1;
        //let cells = [];
        for(currentRow; currentRow < lastKnownRowWithValue + 10; currentRow++){
            if(currentRow % this.chunk == 1){
                await this.getNextSetOfRows(targetWorksheet, currentRow);
            }
            
            console.log(`Getting row ${currentRow}, 4`)
            console.log(targetWorksheet.getCell(currentRow, 4).value)
            if (targetWorksheet.getCell(currentRow, 4).value !==  null) {
                console.log("Updated!")
                lastKnownRowWithValue = currentRow;
            }
        }
        console.log("Fast forwarded pointer")
        this.pointer = lastKnownRowWithValue + 3;    
    }

    async getNextSetOfRows(targetWorksheet, offset){
        if(offset+this.chunk > targetWorksheet.rowCount){
            await targetWorksheet.resize({rowCount: offset + this.chunk * 3, columnCount: this.width})
        }
        console.log(`Loading at offset ${offset}`)
        await targetWorksheet.loadCells({
            startRowIndex: offset,
            endRowIndex: offset + this.chunk,
            startColumnIndex: 2,
            endColumnIndex: 5
        });
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
        this.worksheets = this.metadata.sheetsByIndex;
    }
}
module.exports = googleSheetWriter
const GoogleSheetClient = require('./../clients/googlesheets');
const { promisify } = require('util');

class googleSheetWriter{
    constructor(){
        this.width = 10;
        this.pointer = 0;
        this.googleSheetClient = new GoogleSheetClient(process.env.GOOGLE_SHEETS_ID);
    }

    async init(){
        await this.googleSheetClient.auth(process.env.GOOGLE_SHEETS_USER, process.env.GOOGLE_SHEETS_PRIVATE_KEY);
        this.metadata = await this.googleSheetClient.getMetadata();
        return this;

    }

    async storeDay(day){
        let targetDate = new Date(day[0].start);
        let targetWorksheet = await this.getTargetWorksheet(targetDate);
        let getCellsPromise = promisify(targetWorksheet.getCells);
        let cells = await getCellsPromise({
            'min-row': this.pointer,
            'max-row': day.length + 1,
            'min-col': 0,
            'max-col': this.width,
            'return-empty': true
        });


        for(taskIndex in day){
            let task = day[taskIndex];
            cells[taskIndex * this.width].value = task.date || '';
            cells[taskIndex * this.width + 1].value = '' //FIXME Update ticket number names 
            
            
        }
    }

    async getTargetWorksheet(date){
        var sheetName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long'});
        let sheetToReturn = metadata.find(function(target){
            return sheet.title === sheetName;
        })
        if (sheetToReturn === undefined){
            sheetToReturn = this.googleSheetClient.addWorksheet(sheetName);
        }
        this.metadata = await this.googleSheetClient.getMetadata();
        return sheetToReturn;

    }
}
module.exports = googleSheetWriter
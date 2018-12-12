const GoogleSheets = require('google-spreadsheet');
const { promisify } = require('util');

class GoogleSheetsClient{
    constructor(target_spreadsheet){
        this.doc = new GoogleSheets(target_spreadsheet);        
    }

    async auth(client_email, private_key){
        let authPromise =  promisify(this.doc.useServiceAccountAuth)
        return await authPromise(
            {
                'client_email': client_email,
                'private_key': private_key
            }
        )
    }

    async getMetadata(){
        let infoPromise = promisify(this.doc.getInfo)
        return await infoPromise()
    }

    async addWorksheet(title){
        let addWorksheetPromise = promisify(this.doc.addWorksheet.bind(this.doc))
        return await addWorksheetPromise({"title": title})
    }

}


module.exports = GoogleSheetsClient;

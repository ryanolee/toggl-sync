const {GoogleSpreadsheet} = require('google-spreadsheet');

class GoogleSheetsClient{
    constructor(target_spreadsheet){
        this.doc = new GoogleSpreadsheet(target_spreadsheet);        
    }

    async auth(client_email, private_key){
        return await  this.doc.useServiceAccountAuth(
            {
                'client_email': client_email,
                'private_key': private_key
            }
        )
    }

    async getMetadata(){
        await this.doc.loadInfo()
        return this.doc
    }

    async addWorksheet(title){
        return await this.doc.addWorksheet({"title": title})
    }

}


module.exports = GoogleSheetsClient;

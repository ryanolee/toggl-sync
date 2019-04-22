class TogglProvider{
    /**
     * 
     * @param {TogglClient} client 
     * @param {int} workspaceID
     */
    constructor (client, workspaceID){
        this.client = client;
        this.workspaceID = workspaceID;
    }

    /**
     * Gets days from the past in relation to the number of days specified
     * @param {int} days 
     */
    async getDays(days, since = null){
        since = since|| new Date();
        let toReturn = [];
        since.setHours(0,0,0,0);
        for(let i = 0; i <= days; i++){
            //Get target date by (now - days * 24 hours - datetimeoffset)
            let targetSince = new Date(since.getTime() - ((i+1) * 24 * 60 * 60 * 1000) - (since.getTimezoneOffset() * 60 * 1000));
            let targetUntil = new Date(since.getTime() - (i * 24 * 60 * 60 * 1000) - (since.getTimezoneOffset() * 60 * 1000) - 1000);
            console.log(targetSince, targetUntil);
            let result = await this.client.getReportData(this.workspaceID, targetSince, targetUntil);
            //throw new Error();
            result = result || [];
            toReturn = toReturn.concat(result);
        }
        return toReturn;
    }
}

module.exports = TogglProvider;
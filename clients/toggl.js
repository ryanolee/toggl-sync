
const fetch = require('node-fetch');

class TogglClient{
    constructor (api_key){
        this.api_key = api_key;
    }

    getAuthedRequest(url, options = {}){
        let headers = new fetch.Headers({
            'Authorization': 'Basic ' + Buffer.from( this.api_key + ':api_token').toString('base64')
        });
        return fetch(url, Object.assign(options, {headers: headers}));
    }

    dateToTogglCompatible(targetDate){
        if(!targetDate instanceof Date){
            targetDate = new Date(targetDate);
        }
        return targetDate.toISOString()
    }

    async getReportData(workspaceID, since, until){
        let reportData = [];
        let page = 1;
        let currentData = {};
        since = this.dateToTogglCompatible(since);
        until = this.dateToTogglCompatible(until);
        //Yield all data in the report
        do{
            let response = await this.getAuthedRequest(`https://toggl.com/reports/api/v2/details?user_agent=TogglTimesheetSync&workspace_id=${workspaceID}&since=${since}&until=${until}&page=${page}&order_field=date`);
            currentData = await response.json();
            reportData = reportData.concat(currentData.data);
            page++;
        } while (
            currentData.per_page * page <= currentData.total_count
        )
        return await reportData;
    }
    //3082301
    async getWorkspaces(){
        const response = await this.getAuthedRequest('https://www.toggl.com/api/v8/workspaces');
        return await response.json();
    }



}


module.exports = TogglClient;
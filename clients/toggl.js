
const fetch = require('node-fetch');

const API_BASE_URL = 'api.track.toggl.com'

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
            let response = await this.getAuthedRequest(`https://${API_BASE_URL}/reports/api/v2/details?user_agent=TogglTimesheetSync&workspace_id=${workspaceID}&since=${since}&until=${until}&page=${page}&order_field=date`);
            currentData = await response.json();
            reportData = reportData.concat(currentData.data);
            page++;
            //sleep for 1500 secs to bypass rate limits;
            await this._sleep(1500);
        } while (
            //If we have run out of items or the number of items left fits in one api request
            currentData.per_page * page <= currentData.total_count &&
            currentData.total_count >= currentData.per_page
        )
        return await reportData;
    }
    //3082301
    async getWorkspaces(){
        const response = await this.getAuthedRequest(`https://${API_BASE_URL}/api/v8/workspaces`);
        return await response.json();
    }

    async updateTimeEntry(id, newDescription){
        const response = await this.getAuthedRequest(`https://${API_BASE_URL}/api/v8/time_entries/${id}`,{
            method: 'PUT',
            body: JSON.stringify({
                "time_entry": {
                    "description": newDescription
                }
            })
        })

        return await response.json();
    }

    async getCurrentTimeEntry(){
        const response = await this.getAuthedRequest(`https://${API_BASE_URL}/api/v8/time_entries/current`);
        return await response.json();
    }

    async getTimeEntryByID(id){
        let response = this.getAuthedRequest(`https://${API_BASE_URL}/api/v8/time_entries/${id}`)
        let responseData = await response.json();
        return responseData.data;
    }

    _sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }
}


module.exports = TogglClient;
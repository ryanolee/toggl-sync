
const fetch = require('node-fetch');

class JiraClient{

    constructor (username, api_key, host){
        this.api_key = api_key;
        this.username = username;
        this.host = host;
    }

    getAuthedRequest(url, options = {}){
        let headers = new fetch.Headers({
            'Authorization': 'Basic ' + Buffer.from( this.username + ':' + this.api_key).toString('base64')
        });
        return fetch(url, Object.assign(options, {headers: headers}));
    }

    async search(jql, fields, maxResults){
        fields = fields || '';
        maxResults = maxResults || 25;
        const response = await this.getAuthedRequest(`${this.host}/rest/api/2/search?jql=${jql}&maxResults=${maxResults}&fields=${fields}`);
        return await response.json();
    }

    async getProjectMap(){
        const response = await this.getAuthedRequest(`${this.host}/rest/api/2/project?expand=projectKeys`);
        const data = await response.json();
        let toReturn = {};
        data.forEach((task) => {
            task.projectKeys.forEach((key) => {
                toReturn[key] = task.name
            })
        })
        return toReturn;
    }

    async getSummaryByJiraTicket(ticketNumber){
        const jql = `issue=${ticketNumber}`
        const res = await this.search(jql, 'summary', 1);
        if(res.total === 0){
            return false
        }
        return res.issues[0].fields.summary;//Return exact ticket
    }
}


module.exports = JiraClient;
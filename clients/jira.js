
class JiraClient{

    constructor (username, api_key, host){
        this.api_key = api_key;
        this.username = username;
        this.host = host;
    }

    getAuthedRequest(url, options = {}){
        let headers = new Headers({
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
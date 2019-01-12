const JiraClient = require('../../clients/jira');
var jiraClient = new JiraClient(process.env.JIRA_API_USERNAME, process.env.JIRA_API_KEY, process.env.JIRA_API_HOST) 

module.exports = {
    clientMap: {

    },
    clientMapCache: null,
    apply: async function(task){
        const regex = /([a-zA-Z0-9]{0,4})-(?:\d+)/
        let match = task.description.match(regex);
        task.client = "";
        if(match !== null){
            task.client = match[1].toUpperCase();
            let clientMap = await this.getClientMap();
            if(task.client in clientMap){
                task.client = clientMap[task.client];
            }
        }
        else{
            console.warn(`Missing task from entry: ${JSON.stringify(task)}`);
            task.client = "Unknown"
        }
        return task;
    },
    getClientMap: async function(){
        if (this.clientMapCache === null){
            this.clientMapCache = Object.assign(await jiraClient.getProjectMap(), this.clientMap);
        }
        return this.clientMapCache;
    }
}



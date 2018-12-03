const JiraClient = require('../../clients/jira');
var jiraClient = new JiraClient(process.env.JIRA_API_USERNAME, process.env.JIRA_API_KEY, process.env.JIRA_API_HOST) 
module.exports = {
    cache: {},
    apply: async function (task) {
        task.ticketNumber = null;

        let taskDescription = task.description;
        
        //Matches single jira ticket
        const jiraTicketRegex = /[a-zA-Z0-9]{0,4}-\d+/m;
        let ticketNumber = taskDescription.match(jiraTicketRegex);
        
        if(ticketNumber !== null){
            ticketNumber = ticketNumber[0].toUpperCase();
            task.ticketNumber = ticketNumber;
            const summary = await this.getCachedSummary(ticketNumber)
            taskDescription = `${taskDescription} - ${summary} `;
        }

        task.description = taskDescription;
        return task;
    },
    async getCachedSummary(ticketNumber){
        return '';
        ticketNumber = ticketNumber.toUpperCase();
        if (ticketNumber in this.cache){
            return this.cache[ticketNumber]
        }
        const summary = await jiraClient.getSummaryByJiraTicket(ticketNumber)
        this.cache[ticketNumber] = summary;
        return summary;
    }
}
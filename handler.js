'use strict';

const TogglClient = require('./clients/toggl');
const JiraClient = require('./clients/jira');
const taskTransformations = require('./transformations/tasks');
const dayTransformations = require('./transformations/days');
const groupByDay = require('./grouper');
const googleSheetWriter = require('./storage/googleSheetWriter');
const TogglProvider = require('./providers/togglProvider')
//const {stopCurrentlyRunningEntry} = require('./actions/toggl');

module.exports.sync = async (event, context) => {
	//let togglClient = new TogglClient(process.env.TOGGL_API_KEY);
	//const workSpaceData = await togglClient.getWorkspaces();
	//let togglProvider = new TogglProvider(togglClient,workSpaceData[0].id);
	//let reportData = await togglProvider.getDays(40, new Date());
	//
	//let from = new Date();
	//let until = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
//
	//let fromDispDate = from.toLocaleDateString('en-GB');
	//let toDispDate = until.toLocaleDateString('en-GB');
	//console.log(`Exporting data for ${fromDispDate} to ${toDispDate}`);
//
	//console.log('Gathering report data...');
	////let reportData = await togglClient.getReportData(workSpaceData[0].id, until, from);
	//console.log(`Found ${reportData.length} items to sync with google sheets.`)
//
	//console.log('Applying transformations to tasks...')
	//const transformedReportData = await taskTransformations.apply(reportData);
//
	//console.log('Grouping data by day...')
	//const groupedData = groupByDay(transformedReportData);
//
	////const prunedGroupedData = groupedData.filter(function(day){ return Object.keys(day).length !== 0; })
	//console.log('Applying transformations to day...')
	//const transformedGroupData = await dayTransformations.apply(groupedData);
//
	//console.log('Saving data to google sheets...')
	//let days = transformedGroupData.reverse();
//
	let googleSheet = new googleSheetWriter();
	googleSheet = await googleSheet.init();
	//console.log(JSON.stringify(days))
	//return {}
	const days = require('./data.json')
	for(let day = 0; day < days.length; day++){
		await googleSheet.storeDay(days[day]);
		console.log(`Wrote day ${day + 1} of ${days.length} to timesheets.`)
	}
	console.log('Done!')
	return {};
};


module.exports.refresh = async (event, context) => {
    let togglClient = new TogglClient(process.env.TOGGL_API_KEY);
    let jiraClient = new JiraClient(process.env.JIRA_API_USERNAME, process.env.JIRA_API_KEY, process.env.JIRA_API_HOST);

	const workSpaceData = await togglClient.getWorkspaces();

	let from = new Date();
	let until = new Date(new Date().getTime() - (15 * 60 * 1000));

	console.log('Gathering report data...');
	let tasks = await togglClient.getReportData(workSpaceData[0].id, until, from);
    const jiraTicketRegex = /^\s*([a-zA-Z0-9]{0,4}-\d+)\s*$/;
    let summary = '';
    let taskDescription = '';

    
	for(let task of tasks){
		let ticketNumber = task.description.match(jiraTicketRegex);
        
        if(ticketNumber !== null){
            ticketNumber = ticketNumber[0].toUpperCase();

            console.log(`Updating entry for ${ticketNumber}`);

            summary = await jiraClient.getSummaryByJiraTicket(ticketNumber)
            taskDescription = `${ticketNumber} - ${summary} `;
            await togglClient.updateTimeEntry(task.id, taskDescription);
        }
	}

	console.log('Done!');
	return {}
}
/*
module.exports.stopper = async (event, context) => {
	let togglClient = new TogglClient(process.env.TOGGL_API_KEY);
	console.log(await stopCurrentlyRunningEntry(togglClient))

}*/


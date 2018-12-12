'use strict';

const TogglClient = require('./clients/toggl');
const taskTransformations = require('./transformations/tasks');
const dayTransformations = require('./transformations/days');
const groupByDay = require('./grouper');
const googleSheetWriter = require('./storage/googleSheetWriter');

module.exports.toggl = async (event, context) => {
  let togglClient = new TogglClient(process.env.TOGGL_API_KEY);
  const workSpaceData = await togglClient.getWorkspaces();

  let from = new Date();
  let until = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

  let fromDispDate = from.toLocaleDateString('en-GB');
  let toDispDate = until.toLocaleDateString('en-GB');
  console.log(`Exporting data for ${fromDispDate} to ${toDispDate}`);

  console.log('Gathering report data...');
  let reportData = await togglClient.getReportData(workSpaceData[0].id, until, from);
  console.log(`Found ${reportData.length} items to sync with google sheets.`)

  console.log('Applying transformations to tasks...')
  const transformedReportData = await taskTransformations.applyToTasks(reportData);

  console.log('Grouping data by day...')
  const groupedData = groupByDay(transformedReportData);

  console.log('Applying transformations to day...')
  const transformedGroupData = await dayTransformations.applyToDays(groupedData);

  console.log('Saving data to google sheets...')
  let days = transformedGroupData.reverse();

  let googleSheet = new googleSheetWriter();
  googleSheet = await googleSheet.init();

  
  for(let day = 0; day < days.length; day++){
    await googleSheet.storeDay(days[day]);
    console.log(`Wrote day ${day + 1} of ${days.length} to timesheets.`)
  }
  console.log('Done!')
  return {
  };
};

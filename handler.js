'use strict';

const TogglClient = require('./clients/toggl');
const taskTransformations = require('./transformations/tasks');
const dayTransformations = require('./transformations/days');
const groupByDay = require('./grouper');
const googleSheetWriter = require('./storage/googleSheetWriter');

module.exports.toggl = async (event, context) => {
  let googleSheet = new googleSheetWriter();
  googleSheet = await googleSheet.init();
  return {};



  let togglClient = new TogglClient(process.env.TOGGL_API_KEY);
  const workSpaceData = await togglClient.getWorkspaces();

  let from = new Date();
  let until = new Date();
  until.setDate(1)
  until.setMonth(until.getMonth()-1)

  let reportData = await togglClient.getReportData(workSpaceData[0].id, until, from);
  const transformedReportData = await taskTransformations.applyToTasks(reportData);
  const groupedData = groupByDay(transformedReportData);
  const transformedGroupData = await dayTransformations.applyToDays(groupedData);
  
  

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: workSpaceData,
      input: event,
    }),
  };
};

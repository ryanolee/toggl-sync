# toggl-sync
This repo is aother step in my eturnal war for actually filling in timesheets in on time.

## functions:
This app uses serverless and defines 2 functions that run on cron. It intergrates with jira and toogle to pipe data strait to google sheets.

The functions currently defined are:
 * `toggl_sync` A process that runs nightly and automatically syncs the days work to the exsisting timesheet from toggl.
 * `toggl_refresh` A process that automatically updates entries in toggle based on the given ticket (If the entry is only a ticket number it will automatiacally be updated with it's title in from jira in toggl)

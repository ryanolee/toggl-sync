const Transformations = require('./../index');

module.exports = new Transformations([
    require('./reduceTaskScope'),
    require('./client'),
    require('./jiraEnrich')
]);
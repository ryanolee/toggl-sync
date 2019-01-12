
const Transformations = require('./../index')
module.exports = new Transformations([
    require('./timeAggregate'),
    require('./timeRound'),
    require('./overtime'),
    require('./date')
]);
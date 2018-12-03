
var Transformations = {
    layers:[
        require('./timeAggregate'),
        require('./timeRound'),
        require('./overtime'),
        require('./date')
    ],
    apply: async function(dayData){
        for(const layer in this.layers){
            dayData = await this.layers[layer].apply(dayData);
        }
        return dayData;
    },
    applyToDays: async function(days){
        let transformedDayData = []
        for(day in days){
            transformedDayData.push(await this.apply(days[day]))
        }
        return transformedDayData;
    }
}

module.exports = Transformations;
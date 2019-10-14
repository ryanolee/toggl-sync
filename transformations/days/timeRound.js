/**
 * @type {layer}
 */
module.exports = {
    apply: function(day){
        for(taskIndex in day){
            
            let task = day[taskIndex];
             //Ms to hours conversion
            task.duration = task.duration / (1000 * 3600);
            //Round to nearest .25
            task.duration = Math.max((Math.round(task.duration * 4) / 4).toFixed(2), 0.25);
            //store rounded task time
            day[taskIndex] = task;
        }
        return day;
    }
}
module.exports = {
    apply: function(day){
        let mergedDay = {};
        for(taskIndex in day){
           let task = day[taskIndex];
            //Add time if entry for task already exists
           if(task.ticketNumber in mergedDay){
               mergedDay[task.ticketNumber].duration += task.duration
           }
           //otherwise add task to merge array
           else{
                index = task.ticketNumber || taskIndex;
                mergedDay[index] = task;
           }
        }
        return Object.values(mergedDay);
    }
}
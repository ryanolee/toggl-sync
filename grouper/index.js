function groupByDay(tasks){
    if (tasks.length === 0){
        return [];
    }
    
    let daysToReturn = [];
    let dayTasks = [];
    let previousTime = null;
    let currentTime = new Date(tasks[0].start)
    for(i in tasks){
        previousTime = currentTime;
        currentTime = new Date(tasks[i].start);
        //if we are in the same day
        if (previousTime.getFullYear() === currentTime.getFullYear() &&
            previousTime.getMonth() === currentTime.getMonth() &&
            previousTime.getDay() === currentTime.getDay()){
                dayTasks.push(tasks[i]);
            }
        else{
            daysToReturn.push(dayTasks);
            dayTasks = []
            dayTasks.push(tasks[i]);
        }
    }

    //If no days have passed push last day
    if(daysToReturn.length === 0){
        daysToReturn.push(dayTasks);
    }
    
    return daysToReturn;
}

module.exports = groupByDay;
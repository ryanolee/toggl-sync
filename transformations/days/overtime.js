module.exports = {
    apply: function(day){
        totalTime = day.reduce((total, task) => total+parseFloat(task.duration), 0)
        overtime = Math.max(totalTime - 8, 0);
        day[day.length - 1].overtime = overtime
        return day;
    }
}
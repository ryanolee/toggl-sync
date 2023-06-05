module.exports = {
    apply: function (day) {
        //Set first date in javascript
        let firstTaskDay = new Date(day[0].start);
        day[0].date = firstTaskDay.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric' });
        return day;
    }
}
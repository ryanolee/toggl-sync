module.exports = {
    apply: function(data){
        return {
            "description": data.description,
            "start": data.start,
            "end": data.end,
            "duration": data.dur,
            "overtime": null,
            "day": null
        };
    }
}
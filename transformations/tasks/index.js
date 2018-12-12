
var Transformations = {
    layers:[
        require('./reduceTaskScope'),
        require('./client'),
        require('./jiraEnrich')
    ],
    apply: async function(taskData){
        for(const layer in this.layers){
            taskData = await this.layers[layer].apply(taskData);
        }
        return taskData;
    },
    applyToTasks: async function(tasks){
        let transformedTaskData = []
        for(task in tasks){
            transformedTaskData.push(await this.apply(tasks[task]))
        }
        return transformedTaskData;
    }
}

module.exports = Transformations;
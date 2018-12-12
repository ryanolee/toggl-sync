

module.exports = {
    clientMap: {
        //Insert clients here
    },
    apply: function(task){
        const regex = /([a-zA-Z0-9]{0,4})-(?:\d+)/
        let match = task.description.match(regex);
        task.client = "";
        if(match !== null){
            task.client = match[1].toUpperCase();
            if(task.client in this.clientMap){
                task.client = this.clientMap[task.client];
            }
        }
        else{
            console.warn(`Missing task from entry: ${JSON.stringify(task)}`);
            task.client = "Unknown"
        }
        return task;
    }
}



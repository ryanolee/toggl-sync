const fetch = require('node-fetch')

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

class MyHours {
    constructor() {
        this.api = 'https://api2.myhours.com/api'
        this.default_headers = { 'Content-Type': 'application/json', 'api-version': 1.0 }
    }

    async init() {
        const res = await fetch(`${this.api}/tokens/login`, {
            body: JSON.stringify({
                "grantType": "password",
                "email": process.env.MYHOURS_EMAIL,
                "password": process.env.MYHOURS_PASSWORD,
                "clientId": "api"
            }),
            method: 'post',
            headers: this.default_headers
        })
        const data = await res.json()
        this.default_headers = { ...this.default_headers, 'Authorization': `Bearer ${data.accessToken}` }
    }

    async getFormattedDays() {
        if (!this.default_headers['Authorization']) throw new Error('Please initialize myhours before making api calls')
        let recentLogs = []

        for (let i = 0; i <= 40; i++) {
            const dateToUse = new Date()
            dateToUse.setDate(dateToUse.getDate() - (40 - i))

            let singleDayData = []
            let step = 100

            const data = await this.getLogs(dateToUse, step, 0)
            singleDayData = [...data]
            let currentTotal = data.length
            let page = 1

            while (currentTotal === step) {
                console.log('getting next data...')
                page = page + 1
                const nextData = await this.getLogs(dateToUse, step, (step * page))
                singleDayData = [...singleDayData, ...nextData]
                currentTotal = nextData.length
            }

            if (singleDayData.length > 0) {
                recentLogs = [...recentLogs, singleDayData]
            }
        }

        const logs = this.formatLogs(recentLogs)
        return logs
    }

    async getLogs(dateToUse, step, startIndex) {
        const res = await fetch(`${this.api}/Logs?date=${this.formatDate(dateToUse)}&step=${step}&startIndex=${startIndex}`, { headers: this.default_headers })
        const data = await res.json()
        return data
    }

    formatLogs(logs) {
        let dataToReturn = []

        for (const dayI in logs) {
            const currentDay = logs[dayI]
            let newDay = []

            for (const log of currentDay) {
                const isLogThere = !!newDay.find((foundLog) => this.getLogDate(log) === foundLog.date && foundLog.client === log.clientName && foundLog.description === log.taskName)

                if (isLogThere) continue

                const date = this.getLogDate(log)

                const relatedLogs = currentDay.filter((relatedLog) => this.getLogDate(relatedLog) === date && relatedLog.taskName === log.taskName && relatedLog.clientName === log.clientName && log.id !== relatedLog.id)

                let billableHours = log.billableHours

                for (const relatedLog of relatedLogs) {
                    billableHours += relatedLog.billableHours
                }

                const data = {
                    start: log.date,
                    date,
                    client: log.clientName,
                    description: log.taskName,
                    duration: this.formatDuration(billableHours),
                }

                newDay.push(data)
            }

            dataToReturn.push(newDay)
        }

        return dataToReturn
    }

    formatDuration(duration) {
        return Math.max((Math.round(duration * 4) / 4).toFixed(2), 0.25);
    }

    formatDate(date) {
        return date.toISOString().slice(0, 10)
    }

    getLogDate(log) {
        const date = new Date(log.date)
        return `${days[date.getDay()]} ${date.getDate()}`
    }
}

module.exports = MyHours
((queueService, fs, { serverState }) => {

    const addToQueueHistory = (prompt) => {
        const queueHistory = JSON.parse(fs.readFileSync('./queue_history.json'));
        queueHistory.queue.push(prompt);
        fs.writeFileSync('./queue_history.json', JSON.stringify(queueHistory));
    };

    queueService.addToQueueHistory = addToQueueHistory;

    const addToQueue = (prompt) => {
        serverState.queue.push(prompt);
        addToQueueHistory(prompt);
    };

    queueService.addToQueue = addToQueue;

})(module.exports, require('fs'), require('../state'));
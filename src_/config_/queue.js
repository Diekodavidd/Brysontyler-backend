const { Queue } = require("bullmq");

const connection = {
    url: process.env.REDIS_URL,
};

const emailQueue = new Queue("email", {
    connection,
});

const notificationQueue = new Queue("notifications", {
    connection,
});

module.exports = {
    emailQueue,
    notificationQueue,
};
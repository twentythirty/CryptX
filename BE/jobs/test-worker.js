var scheduler = require('node-schedule');

scheduler.scheduleJob('test-job', '15 */2 * * * * ', (date) => {
    console.log('technically i run once every 2 minutes, 15 seconds passed the minute. I was supposed to run at ', date);
});
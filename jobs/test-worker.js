'use strict';

var scheduler = require('node-schedule');

scheduler.scheduleJob('fetch-market-history-detail', '* */4 * * * * ', (date) => {
    console.log('technically i run once every 4 minutes on the minute. I was supposed to run at ', date);
});
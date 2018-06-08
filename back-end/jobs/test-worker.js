'use strict';

// var scheduler = require('node-schedule');

// scheduler.scheduleJob('multi-work1', '*/15 * * * * * ', async (date) => {

//     console.log(`[JOB.1]: Job started at ${date}`);
//     for (var i = 0; i < 17; i++) {
//         const sleep_for = 5000 + (Math.random() * 1000);
//         console.log(`[JOB.1]: Sleeping for ${sleep_for}ms...`);
//         await new Promise(resolve => setTimeout(resolve, sleep_for));
//         console.log(`[JOB.1]: Done with sleep, its ${new Date()}`);
//     }
//     console.log(`[JOB.1]: Job ending at ${new Date()}`);
// });

// scheduler.scheduleJob('multi-work2', '*/17 * * * * * ', async (date) => {

//     console.log(`[JOB.2]: Job started at ${date}`);
//     for (var i = 0; i < 18; i++) {
//         const sleep_for = 2500 + (Math.random() * 1000);
//         console.log(`[JOB.2]: Sleeping for ${sleep_for}ms...`);
//         await new Promise(resolve => setTimeout(resolve, sleep_for));
//         console.log(`[JOB.2]: Done with sleep, its ${new Date()}`);
//     }
//     console.log(`[JOB.2]: Job ending at ${new Date()}`);
// });
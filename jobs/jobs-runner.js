'use strict';

var scheduler = require('node-schedule');
//load configuration relevant to jobs accessing DB and other constants
var config = require('../config/db-job-config');
//analyze file tree
var fs = require('fs');
var path = require('path');

//this filename (to exclude from loading)
const this_filename = path.basename(__filename);

/**
 * Holds imported JOB files from this directory
 * 
 * 
 * Imported jobs need to export a SCHEDULE cron string and
 * a JOB_BODY (CONFIG, Date) => Any function.
 * 
 * Jobs will be identified by NAME (default - filename sans .js)
 */
let runnable_jobs = {};

fs.readdirSync(__dirname).filter(filename => {
    //allow files that are NOT

    return (
        //config dotFiles
        filename.indexOf('.') != 0 &&
        //this file
        (filename !== this_filename) &&
        //are non-source files
        (filename.slice(-3) === '.js')
    )
}).forEach(filename => {
    console.log(`loading job file ${filename}...`);
    const loaded_job = require(path.join(__dirname, filename));
    //skip adding job files without schedules
    if (loaded_job.SCHEDULE) {
        const job_name = loaded_job.NAME ? loaded_job.NAME : filename.slice(filename.length - 3);
        console.log(`Adding job ${job_name} with schedule ${loaded_job.SCHEDULE}`);
        runnable_jobs[job_name] = loaded_job;
    } else {
        console.log(`Skipping loaded job file ${filename} - NO SCHEDULE!`);
    }
});


//once DB is loaded, load the jobs
config.dbPromise.then(() => {

    console.log(`scheduling ${Object.keys(runnable_jobs).length} jobs...`);
    _.forEach(runnable_jobs, (loaded_job, job_name) => {
        console.log(`Scheduling ${job_name} for ${loaded_job.SCHEDULE}`);
        scheduler.scheduleJob(job_name, loaded_job.SCHEDULE, async (date) => {
            const start = date;
            console.log(`[JOB.${job_name}]: Job start at ${date}`);
            //run job body with passed config object
            const result = await loaded_job.JOB_BODY(config, date);
            console.log(`[JOB.${job_name}]: Job finish at ${date} (result: ${result}).\nJob took ${new Date().getTime() - start.getTime()}ms`);
        });
    });
});
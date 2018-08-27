'use strict';

const scheduler = require('node-schedule');
const Bottleneck = require('bottleneck');
//load configuration relevant to jobs accessing DB and other constants
const config = require('../config/db-job-config');
//analyze file tree
const fs = require('fs');
const path = require('path');
const util = require('util');

//this filename (to exclude from loading)
const this_filename = path.basename(__filename);
/**
 * Object which will hold different types of limiters.
 * Not all jobs will might need the same rules.
 */
const limiters = {
    CCXT_REQUEST: new Bottleneck({
        id: 'CCXT_REQUEST',
        minTime: process.env.CCXT_REQUEST_LIMITER_DELAY || 3000 //For now let's give each job a 3 second wait. Most request limiters allow at least 1-3 request per second. 
    })
};


/**
 * Holds imported JOB files from this directory
 * 
 * 
 * Imported jobs need to export a SCHEDULE cron string and
 * a JOB_BODY(CONFIG, LOGGER, DATE) => Any function. 
 * 
 * Jobs will be identified by NAME (default - filename sans .js)
 * the job NAME will become part of its logger prefix, so a custom one is advisable
 */
let runnable_jobs = {};

fs.readdirSync(__dirname).filter(filename => {
    //only allow files that are NOT
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
    //skip adding job files without schedules or jobs that dont have JOB_BODY functions
    if (loaded_job.SCHEDULE && _.isFunction(loaded_job.JOB_BODY)) {
        const job_name = loaded_job.NAME ? loaded_job.NAME : filename.slice(filename.length - 3);
        console.log(`Adding job ${job_name} with schedule ${loaded_job.SCHEDULE}`);
        runnable_jobs[job_name] = loaded_job;
    } else {
        console.log(`Skipping loaded job file ${filename} - NO SCHEDULE data or NO JOB_BODY function!`);
    }
});


//create individual logging pipes that let the jobs use name prefix
const logger_maker = (job_name) => {

    return (message, ...args) => {
        console.log(`[JOB.${job_name}]: ${message}`, ...args)
    }
}

/**
 * List of one-off jobs to run once from command line instead of starting the scheduler and waiting.
 * remains empty when run via scheduler
 */
let one_off_list = [];

//populate one-offs list if the jobs are being run directly form command line
if (process.argv[2] != null && process.argv[2].trim()) {
    one_off_list = process.argv[2].trim().split(',').map(job_name => job_name.trim());
}

//run all specified one-off jobs simultaneously with dedicated config and loggers (ignoring actual schedules)
//
//running them sequentially would have encourage chronological flow dependencies which 
//cannot be guaranteed in a production environment, hence its not currently a feature
//and adding it is strongly discouraged.
if (one_off_list.length > 0) {
    //run one-off tasks, ignore schedules
    const allowed_jobs = _.pickBy(runnable_jobs, (job, name) => {
        return one_off_list.includes(name)
    });
    const all_start = new Date();
    config.dbPromise.then(() => {
        console.log(`running ${Object.keys(allowed_jobs).length} jobs...`);
        return Promise.all(_.map(allowed_jobs, (job, name) => {
            const log = logger_maker(name);
            let start = new Date();
            log(`Job start at ${start}`);
            return job.JOB_BODY(config, log).then(done => {
                log(`Job finish at ${new Date()} (result: ${done}). Job took ${new Date().getTime() - start.getTime()}ms`);
            });
        }));
    }).then(done => {
        console.log(`All ${Object.keys(allowed_jobs).length} jobs done!\nTotal time: ${new Date().getTime() - all_start.getTime()}ms`);
        process.exit(0);
    });
} else {
    //run jobs by schedule
    //once DB is loaded, load the jobs
    config.dbPromise.then(async () => {
        
        /**
         * Wait for limiters to be ready.
         * Currently, this will be done instantly, however in case the app will be clustered and
         * Redis will be used, this code will be compatible with clustering.
         */
        await Promise.all(Object.values(limiters).map(limiter => limiter.ready()));

        //Once the database and limiters are ready, register events
        registerEvents();

        console.log(`scheduling ${Object.keys(runnable_jobs).length} jobs...`);
        _.forEach(runnable_jobs, (loaded_job, job_name) => {
            
            if (loaded_job.SCHEDULE == -1) {
                console.log(`Job ${job_name} is a designed one-off without schedule, skipping!...`)
            } else {
                console.log(`Scheduling ${job_name} for ${loaded_job.SCHEDULE}`);
                scheduler.scheduleJob(job_name, loaded_job.SCHEDULE, async (date) => {
                    const start = date;
                    const log = logger_maker(job_name);
                    log(`Job start at ${date}`);
                    //check if a limiter needs to be applied for the job
                    let limiter = loaded_job.LIMITER;
                    if(limiter && limiters[limiter]) {
                        
                        /**
                         * Let's prevent queueing the same job more than once.
                         * Bottleneck returns a status if a job is placed or running, otherwise it returns null
                         */
                        if(limiters[limiter].jobStatus(loaded_job.NAME)) return;

                        const result = await limiters[limiter].schedule({
                            id: loaded_job.NAME
                        }, loaded_job.JOB_BODY, config, log, date);
                        log(`Job finish at ${date} (result: ${result}). Job took ${new Date().getTime() - start.getTime()}ms`);
                    }
                    else {
                        //run job body with passed config object and job-specific logger
                        const result = await loaded_job.JOB_BODY(config, log, date);
                        log(`Job finish at ${date} (result: ${result}). Job took ${new Date().getTime() - start.getTime()}ms`);
                    }
                });
            }
        });
    });
}

/**
 * Go through each limiter and add an error listener.
 * Currently, this will be only called if the job has an uncaught error (which they shouldn't). But in case one occurs, this will be called.
 * In case of clustering, Redis errors will go here.
 */
const registerEvents = async () => {
    const { logAction } = require('../utils/ActionLogUtil');

    Object.values(limiters).map(limiter => {
        limiter.on('error', error => {
            console.error(`\x1b[41m[LIMITER ${limiter.id}]\x1b[0m ERROR: ${error.message}`);
            logAction('universal.error', {
                args: { error: error.message },
                log_level: LOG_LEVELS.Error
            });
        });

        if(process.env.NODE_ENV === 'dev') {
            limiter.on('debug', (message, data) => {
                console.log(`\x1b[42m[LIMITER ${limiter.id}]\x1b[0m MESSAGE: ${message}`);
                console.log(`\x1b[42m[LIMITER ${limiter.id}]\x1b[0m DATA: ${util.inspect(data)}`);
            });
        }
    });
}

'use strict';

const chai = require('chai');


const descriptionToJobFile = {
    'synchronize coins list': 'coins-list-sync',
    'generate execution orders': 'exec-order-generator',
    'fetch instrument volumes': 'exchange-volume-fetcher',
    'fetch instruments ask/bid prices': 'exchange-ask-bid-fetcher'
}

/**
 * Resolve the description sentence to a local map of job files and complete the job using system models
 * and console.log
 * @param {String} description the sentence to match a job file to
 */
module.exports.finishJobByDescription = async (description) => {

    const jobFileName = descriptionToJobFile[description];

    chai.assert.isDefined(jobFileName, `No valid job filename found for description "${description}"!`)

    const job = require(`../../../jobs/${jobFileName}`);
    const models = require('../../../models');
    const config = { models };

    return await job.JOB_BODY(config, console.log);
}
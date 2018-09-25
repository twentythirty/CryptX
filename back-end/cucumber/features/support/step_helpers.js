'use strict';

const chai = require('chai');


const descriptionToJobFile = {
    'synchronize coins list': 'coins-list-sync',
    'generate execution orders': 'exec-order-generator',
    'fetch instrument volumes': 'exchange-volume-fetcher',
    'fetch instruments ask/bid prices': 'exchange-ask-bid-fetcher',
    'place execution orders on exchanges': 'cucumber-exchange-order-placer'
}

/**
 * Resolve the description sentence to a local map of job files and complete the job using system models
 * and console.log
 * @param {String} description the sentence to match a job file to
 * @param {Object} custom_config extra configuration to be put in the config job map
 */
module.exports.finishJobByDescription = async (description, custom_config = {}) => {

    const jobFileName = descriptionToJobFile[description];

    chai.assert.isDefined(jobFileName, `No valid job filename found for description "${description}"!`)

    const job = require(`../../../jobs/${jobFileName}`);
    const models = require('../../../models');
    const config = Object.assign({ models }, custom_config);

    return await job.JOB_BODY(config, console.log);
}
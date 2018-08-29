'use strict';

const logger = require('../utils/ActionLogUtil');

module.exports.response_token_refresh = (req, res, next) => {

    if (req.user == null || req.user.session == null) {
        const message = `Missing user object or session object on request body for ${req.path}! Not adding new token to response...`;
        console.error(`Missing user object or session object on request body for ${req.path}! Not adding new token to response...`);
        //leave this promise to persiste log messsage
        logger.log(message, {
            log_level: LOG_LEVELS.Error
        })
        next()
    }
    //add token string to response object (will be used in ReS global)
    res.next_token = req.user.session.token;

    next();
};
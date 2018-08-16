'use strict';

const logger = require('../utils/ActionLogUtil');

module.exports.response_token_refresh = (req, res, next) => {

    if (req.user == null || req.user.session == null) {
        //leave this promise to persiste log messsage
        logger.log(`Missing user object or session object on request body! Not adding new token to response...`, {
            log_level: LOG_LEVELS.Error
        })
        next()
    }
    //add token string to response object (will be used in ReS global)
    res.new_token = req.user.session.token;

    next();
};
'use strict'

//content type json to all reposnses
module.exports.content_json = (req, res, next) => {
    //add json content header in case of success of response
    if (res.status < 300) {
        res.setHeader("Content-Type", "application/json");
    }

    next();
};
'use strict'

//content type json to all reposnses
module.exports.content_json = (req, res, next) => {
    res.setHeader("Content-Type", "application/json");

    next();
};
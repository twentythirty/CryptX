'use strict';

const filter_resolve = require('../utils/QueryFilterUtil');

module.exports.resolve_list_filter = (req, res, next) => {
    //check the POST request for a "filter" key and resolve that filter to a 
    //sequelize-usable object for endpoints
    if (req.method === 'POST') {
        if (req.body.filter) {
            req.seq_where = filter_resolve(
                typeof req.body.filter === 'object' ? req.body.filter : {}
            )
        } else {
            req.seq_where = {};
        }
    } else {
        req.seq_where = {};
    }

    next();
};
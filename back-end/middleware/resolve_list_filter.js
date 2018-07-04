'use strict';

const filter_resolve = require('../utils/QueryFilterUtil');

module.exports.resolve_list_filter = (req, res, next) => {
    //check the POST request for a "filter" key and resolve that filter to a 
    //sequelize-usable object for endpoints
    if (req.method === 'POST') {
        req.seq_query = {};
        if (req.body.filter) {
            req.seq_where = filter_resolve(
                typeof req.body.filter === 'object' ? req.body.filter : {}
            )

            req.seq_query.where =  req.seq_where;
        } else {
            req.seq_where = {};
            req.seq_query.where = {};
        }

        req.seq_query.order = req.body.order ? parseOrder(req.body.order) : null;
        req.seq_query.limit = req.body.limit ? parseInt(req.body.limit) : null;
        req.seq_query.offset = req.body.offset ? parseInt(req.body.offset) : null;
    } else {
        req.seq_where = {};
    }

    next();
};

const parseOrder = (order) => {
    /* expect ordering structure to be like
    [
      { by: "first_name", order: "desc"},
      { by: "last_name", order: "asc"}
    ] */

    if (
        !order ||
        typeof order !== "object" ||
        order.some(o => // if some elements of array doesn't include keys by and order
            !['by', 'order'].every(k => Object.keys(o).includes(k))
        )
    )
        return null;

    return order.map(o => [o.by, o.order]);
};
'use strict';

const { ActionLog } = require('../models');

const id_dictionary = {
    deposit_id: 'recipe_run_deposit_id'
};

const getActionLogs = async (req, res) => {

    let { seq_query } = req;

    if(!_.isPlainObject(seq_query)) seq_query = { where: {} };

    //Go through all the params and see if any match the id dictionary.
    //The this will work only on details endpoints, exmaple: /deposits/:deposit_id
    for(let param in req.params) {
        const id_key = id_dictionary[param];
        if(id_key) seq_query.where[id_key] = req.params[param];
    }

    //Apart from filtering we dont use the other ids for now, so let's make the response less bulky for now.
    seq_query.attributes = ['id', 'timestamp', 'details'];

    //Newest first if the ordering is not provided.
    if(!seq_query.order) seq_query.order = [ [ 'timestamp', 'DESC' ] ];

    const [ err, result ] = await to(ActionLog.findAndCount(seq_query));
    if(err) return ReE(res, err.message, 422);

    const { count, rows: action_logs } = result;

    return ReS(res, { 
        action_logs,
        count
     });
};
module.exports.getActionLogs = getActionLogs;
'use strict';

const ActionLog = require('../models').ActionLog;
const UserSession = require('../models').UserSession;

const allowed_relations = [
    'asset_id',
    'exchange_account_id',
    'exchange_id',
    'execution_order_id',
    'instrument_id',
    'investment_run_id',
    'recipe_order_id',
    'recipe_run_deposit_id',
    'recipe_run_id',
    'role_id',
    'user_id'
];

/**
 * Logs an action. Can be used as a base function.
 * @param {String} details Text describing the action.
 * @param {Object} [options={}] Additional options for the log.
 * @param {Object|Array} options.relations Object or an array of objects that specified relations. Example: `{ asset_id: 21 }` or `[{ user_id: 1 }, { role_id: 2 }]`.
 * @param {Object} options.user Object describing the user performing the action.
 * @param {Number} options.user.id ID of the user performing the action.
 * @param {Number} options.session_id Session ID related to the action.
 * @param {Boolean} options.user.session Set to true in order for the logger to fetch the session id of the user.
 * @returns {Promise} Resolves in a new action log object.
 */
const log = async (details, options = {}) => {

    if(!_.isString(details)) TE(`Details must be a string`);

    let base_log = {
        details,
        timestamp: new Date(),
        user_session_id: null,
        performing_user_id: null
    };

    if(!_.isPlainObject(options)) TE(`Options must be an object`);

    if(options.relations) {

        let relations = options.relations;

        if(_.isPlainObject(relations)) {
            relations = [ relations ];
        }

        if(!_.isArray(relations)) TE(`options.relations must be an object or an array of objects`);

        for(let relation of relations) {

            if(!_.isPlainObject(relation)) TE(`Relation must a valid object`);
            if(!allowed_relations.includes(Object.keys(relation)[0])) TE(`Key ${relation.key} is not allowed.`);

            Object.assign(base_log, relation);
        }

    }

    if(options.user) {
        const user = options.user;
        if(!user.id) TE(`User id must be provied when attaching a performing user`);

        base_log.performing_user_id = user.id;

        //If session was se to true
        if(user.session) {
            //Might be best to pass the session in the session middleware
            const [ err, session ] = await to(UserSession.findOne({
                where: {
                    user_id: user.id
                },
                order: [ ['expiry_timestamp', 'DESC'] ]
            }));

            if(err) TE(err.message);
            if(!session) TE(`Session not found for user`);

            base_log.user_session_id = session.id;
        }
        //For the future if the session will be passed along
        if(user.session_id) base_log.user_session_id = user.session_id;
    }

    return ActionLog.create(base_log);

};

module.exports = {
    log
};
'use strict';

const failed_attempts_limit = 5;
const base_delay = 1 * 1000;

const { 
    ForeignKeyConstraintError, 
    ConnectionError, 
    ConnectionRefusedError, 
    ConnectionTimedOutError,
    HostNotReachableError
} = require('sequelize');

/*const { 
    ActionLog, UserSession, User, Role,
    Asset, ExchangeAccount, Exchange, Instrument,
    InvestmentRun, RecipeRun, RecipeRunDeposit,
    RecipeOrder, ExecutionOrder, 
} = require('../models');*/

const allowed_keys = [
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
    'user_id',
    'performing_user_id',
    'user_session_id'
];

const universal_actions = {
    create: {
        get template() { return `A new ${this.name} was created` },
        get template_user() { return `${this.user.first_name} ${this.user.last_name} added a new ${this.name}`},
        handler: function(params = {}) {
            let table_name = params.instance.constructor.getTableName();
            this.name = _.startCase(table_name);
            
            const relation_key = `${table_name}_id`;
            this.relations = { [relation_key]: params.instance.id }
            if(!allowed_keys.includes(relation_key)) this.relations = {};
            
            if(params.user) {
                this.user = params.user;
                return this.template_user;
            }
            else return this.template;
        }
    },
    modified: {
        get template() { return `${this.column} was changed from ${prev_value || '-'} to ${new_value || '-'}` },
        get template_user() { return `${this.user.first_name} ${this.user.last_name} changed ${this.column} from ${this.prev_value || '-'} to ${this.new_value || '-'}`},
        handler: function(params = {}) {
            let { previous_instance, updated_instance } = params;
            let action_logs = [];
            const ignore = params.ignore || []; //Ignore keys.
            const replace = params.replace || {};

            let table_name = params.updated_instance.constructor.getTableName();
            this.name = _.startCase(table_name);

            const relation_key = `${table_name}_id`;
            this.relations = { [relation_key]: params.updated_instance.id }
            if(!allowed_keys.includes(relation_key)) this.relations = {};
            
            if(params.user) this.user = params.user;

            if(previous_instance.toJSON) previous_instance = previous_instance.toJSON();
            if(updated_instance.toJSON) updated_instance = updated_instance.toJSON();
            
            for(let key in previous_instance) {
                if(ignore.includes(key)) continue;

                //Sequelize like to convert float to string, so better convert if that happens;
                let previous = previous_instance[key];
                let updated = updated_instance[key];
                if(!isNaN(previous) && _.isString(previous)) previous = parseFloat(previous);
                if(!isNaN(updated) && _.isString(updated)) updated = parseFloat(updated); 

                if(!_.isEqual(previous, updated)) {
                    
                    this.column = _.startCase(key);

                    //Replace unique names like statuses
                    if(replace[key]) {
                        this.prev_value = replace[key][previous];
                        this.new_value = replace[key][updated];
                    }
                    else {
                        this.prev_value = previous;
                        this.new_value = updated;
                    }

                    if(params.user) action_logs.push(this.template_user);
                    else action_logs.push(this.template);
                }
            }

            return action_logs;
        }
    }
};

const logAction = async (action_path, options = {}) => {
    try {
        const action = _.get(universal_actions, action_path);
        if(!action) return log(`Action with path "${action_path}" does not exist`);
    
        let action_logs = null;
        if(_.isFunction(action.handler)) action_logs = action.handler(options);
    
        if(!action_logs) log(`Handler failed to return log string for action path "${action_path}" and params: ${JSON.stringify(params)}`);
    
        if(_.isString(action_logs)) action_logs = [action_logs];
    
        //This will attempt to assign relations created by the handler, but also allow the developer to overwrite them.
        if(_.isPlainObject(options.relations)) options.relations = Object.assign({}, action.relations || {}, options.relations);
    
        for(let action_log of action_logs) {
            log(action_log, options || {});
        }
    }
    catch(e) {
        console.error(e);
        log(e.message);
    }
};

/**
 * Logs an action. Can be used as a base function.
 * @param {String} details Text describing the action.
 * @param {Object} [options={}] Additional options for the log.
 * @param {Object} options.relations Object of specified relations. Example: `{ asset_id: 21, exchange_id: 1 }`.
 * @returns {Promise} Resolves in a new action log object.
 */
const log = async (details, options = {}) => {

    if(!_.isString(details)) details = JSON.stringify(details);

    let base_log = {
        details,
        timestamp: new Date(),
        failed_attempts: 0
    };

    if(_.isPlainObject(options.relations)) {

        let relations = options.relations;

        for(let key in relations) {
            if(!allowed_keys.includes(key)) {
                log(`Log validation error: relations key "${key}" is not allowed`);
                delete relations[key];
            }
            else base_log[key] = relations[key];
        }

    }

    _saveToDatabase(base_log);
};

const _saveToDatabase = async (action_log) => {

    if(action_log.failed_attempts > failed_attempts_limit) {
        return console.log(`Failed to log "${action_log.details}" after ${action_log.failed_attempts} failed attempts`);
    }

    //This is required here due the fact that the model is not created when it is used in the User model.
    //May need to think of solution, for now, this works.
    const ActionLog = require('../models').ActionLog;

    /**
     * Attempts to catch certain errors:
     * 1. During Foreign Constraint error, the logger will strip the foreign keys and log the error and stripped message.
     * 2. On different connection errors, it will delay the log in hopes that the connection will be restored by that time.
     * 3. During unknown error simply log the error. More error handling may be added later,
     */
    ActionLog.create(action_log)
        .catch(ForeignKeyConstraintError, message => {
            action_log.failed_attempts++;
            //Later on, specific keys may be stripped using string match, this iwll depend how often this error occurs durring log.
            _saveToDatabase(_cleanOfRelations(action_log));
            log(`Constraint error occured during log: "${message}", while logging: "${action_log.details}"`);
        })
        .catch(ConnectionError, message => {
            console.log(`Connection error: ${message} while logging: "${action_log.details}"`);
            action_log.failed_attempts++;
            _delayLog(action_log);
        })
        .catch(ConnectionRefusedError, message => {
            console.log(`Connection refused error: ${message} while logging: "${action_log.details}"`);
            action_log.failed_attempts++;
            _delayLog(action_log);
        })
        .catch(ConnectionTimedOutError, message => {
            console.log(`Connection time out error: ${message} while logging: "${action_log.details}"`);
            action_log.failed_attempts++;
            _delayLog(action_log);
        })
        .catch(HostNotReachableError, message => {
            console.log(`Host not reachable error: ${message} while logging: "${action_log.details}"`);
            action_log.failed_attempts++;
            _delayLog(action_log);
        })
        .catch(error => {
            console.error(error);
            log(`Error occured durring logging of: "${action_log.details}", error received: ${error.message}`);
        });
}

const _cleanOfRelations = (action_log) => {
    for(let key of Object.keys(relations_to_models)) {
        delete action_log[key];
    }
    return action_log;
}

const _delayLog = async (action_log) => {
    //console.log('Connection error to the database occured while logging');
    setTimeout(() => {
        _saveToDatabase(action_log);
    }, base_delay * action_log.failed_attempts);
}

const _getFormatedName = (instance) => {
    const table_name = instance.constructor.getTableName();
    return _.startCase(table_name);
}

module.exports = {
    log, logAction
};
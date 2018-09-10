const { in: opIn } = require('sequelize').Op;
const translations = require('../public/fe/i18n/en.json');

/**
 * Example of custom loggers:
 * They can be created without a handler and create 2 getters (template and template_user).
 * template_user is taken when a user object is passed to options/params.
 * this.params will be all the otpions passed in the logAction function.
 * You can add your own handler which will receive the passed options.
 * 
 * NEW: a "level" can be added for specific log type. "level" is overriden if "log_level" is passed in the options.
 * 
 * !!!!!!!!!!!DEPRICATED!!!!!!!!!! 
 */
module.exports = {
    example: {
        get template() { return `Example log with params: ${JSON.stringify(this.params)}` },
        get template_user() { return `Example log called by ${this.params.user.first_name} ${this.params.user.last_name} with params: ${JSON.stringify(this.params)}` }
    },
    example_with_handler: {
        get custom_template() { return `The sum of ${this.first} and ${this.second} is ${this.result}` },
        handler: function(params = {}) {
            this.first = params.first || 2;
            this.second = params.second || 2;
            this.result = this.first + this.second;

            return this.custom_template;
        }
    },
    instrument_exchange_mappings: {
        add_and_remove: {
            handler: async function(options = {}) {
                const { Exchange } = require('../models');
                const { replaceArgs } = require('../utils/ActionLogUtil');

                const { deleted_mappings, new_mappings, modified_mappings } = options;
                const exchange_ids = _.uniq(deleted_mappings.map(map => map.exchange_id).concat(
                    new_mappings.map(map => map.exchange_id).concat(
                        modified_mappings.map(map => map.exchange_id)
                    )
                ));

                const exchanges = await Exchange.findAll({
                    where: { id: { [opIn]: exchange_ids } }
                });

                const logs = [];

                addLogs('removed', deleted_mappings);
                addLogs('added', new_mappings);
                addLogs('modified', modified_mappings);

                return logs;

                function addLogs (type, mappings) {

                    for(let mapping of mappings) {
                        const exchange = exchanges.find(ex => ex.id === mapping.exchange_id) || {};
    
                        let template = `logs.instruments.mapping_${type}`;
                        if(options.user) template += '_user';
    
                        const _options = Object.assign({}, options);
    
                        _options.args = Object.assign({}, _options.args || {}, {
                            exchange: exchange.name,
                            identifier: mapping.external_instrument_id
                        });
    
                        logs.push({
                            details: replaceArgs(_.get(translations, template, ''), _options.args),
                            template,
                            options: _options
                        });
                    }

                }

            }
        }
    }



    /*deposits: {
        generate: {
            level: ACTIONLOG_LEVELS.Info,
            get template() { return `${this.params.amount} ${this.params.amount === 1 ? 'Deposit' : 'Deposits'} were generate for Recipe Run RR-${this.params.relations.recipe_run_id}` }
        }
    },
    execution_orders: {
        placed: {
            level: ACTIONLOG_LEVELS.Info,
            get template() { return `Order was placed to ${this.params.exchange}` }
        },
        error: {
            level: ACTIONLOG_LEVELS.Error,
            get template() { return `Error: ${this.params.error}` }
        },
        failed_attempts: {
            level: ACTIONLOG_LEVELS.Warning,
            get template() { return `Execution order Failed after ${this.params.attempts === 1 ? `${this.params.attempts} attempt` : `${this.params.attempts} attempts`}` }
        },
        failed: {
            level: ACTIONLOG_LEVELS.Warning,
            get template() { return `Execution order Failed due to: ${this.params.reason}` }
        },
        generate_fill: {
            level: ACTIONLOG_LEVELS.Info,
            get template() { return `Generated a new fill with amount of ${this.params.amount}` }
        },
        fully_filled: {
            level: ACTIONLOG_LEVELS.Info,
            get template() { return `Execution order was Fully Filled.` }
        }
    },
    ask_bid_fetcher: {
        failed_to_fetch: {
            level: ACTIONLOG_LEVELS.Info,
            get template() {
                const { exchange, instruments } = this.params;
                return `System didn't receive prices from "${exchange.name}" exchange for instruments: ${instruments}`
            }
        }
    },
    assets: {
        status: {
            level: ACTIONLOG_LEVELS.Info.ACTIONLOG_LEVELS,
            get template() {
                const { old_status, new_status, reason } = this.params;
                const { Whitelisting, Blacklisting, Graylisting } = INSTRUMENT_STATUS_CHANGES;
                const statuses = {
                    [Whitelisting]: 'Whitelisted',
                    [Blacklisting]: 'Blacklisted',
                    [Graylisting]: 'Graylisted'
                };
                return `System changed Status from ${statuses[old_status]} to ${statuses[new_status]} due to ${reason}`
            },
            get template_user() {
                const { user, old_status, new_status, reason } = this.params;
                const { Whitelisting, Blacklisting, Graylisting } = INSTRUMENT_STATUS_CHANGES;
                const statuses = {
                    [Whitelisting]: 'Whitelisted',
                    [Blacklisting]: 'Blacklisted',
                    [Graylisting]: 'Graylisted'
                };
                return `${user.first_name} ${user.last_name} changed Status from ${statuses[old_status]} to ${statuses[new_status]}, reason: ${reason}`
            }
        }
    }*/
};
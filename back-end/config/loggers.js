/**
 * Example of custom loggers:
 * They can be created without a handler and create 2 getters (template and template_user).
 * template_user is taken when a user object is passed to options/params.
 * this.params will be all the otpions passed in the logAction function.
 * You can add your own handler which will receive the passed options.
 * 
 * NEW: a "level" can be added for specific log type. "level" is overriden if "log_level" is passed in the options.
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
    deposits: {
        generate: {
            level: LOG_LEVELS.Info,
            get template() { return `${this.params.amount} ${this.params.amount === 1 ? 'Deposit' : 'Deposits'} were generate for Recipe Run RR-${this.params.relations.recipe_run_id}` }
        }
    },
    execution_orders: {
        placed: {
            level: LOG_LEVELS.Info,
            get template() { return `Order was placed to ${this.params.exchange}` }
        },
        error: {
            level: LOG_LEVELS.Error,
            get template() { return `Error: ${this.params.error}` }
        },
        failed_attempts: {
            level: LOG_LEVELS.Warning,
            get template() { return `Execution order Failed after ${this.params.attempts === 1 ? `${this.params.attempts} attempt` : `${this.params.attempts} attempts`}` }
        },
        failed: {
            level: LOG_LEVELS.Warning,
            get template() { return `Execution order Failed due to: ${this.params.reason}` }
        },
        generate_fill: {
            level: LOG_LEVELS.Info,
            get template() { return `Generated a new fill with amount of ${this.params.amount}` }
        },
        fully_filled: {
            level: LOG_LEVELS.Info,
            get template() { return `Execution order was Fully Filled.` }
        }
    }
};
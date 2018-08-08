/**
 * Example of custom loggers:
 * They can be created without a handler and create 2 getters (template and template_user).
 * template_user is taken when a user object is passed to options/params.
 * this.params will be all the otpions passed in the logAction function.
 * You can add your own handler which will receive the passed options.
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
            get template() { return `${this.params.amount} ${this.params.amount === 1 ? 'Deposit' : 'Deposits'} were generate for Recipe Run RR-${this.params.relations.recipe_run_id}` }
        }
    }
};
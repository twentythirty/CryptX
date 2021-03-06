const { Given, When, Then, After, Before } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { failureResponse, successResponse } = require('../support/assert');

const World = require('../support/global_world');
const utils = require('../support/step_helpers');

const non_mvp_exchanges = [
    { name: 'Bitstamp', api_id: 'bitstamp' },
    { name: 'Bittrex', api_id: 'bittrex' },
    { name: 'HitBTC', api_id: 'hitbtc2' },
    { name: 'Kraken', api_id: 'kraken' },
    { name: 'Huobi', api_id: 'huobipro' }
];

Then(/^the server return a (.*) response$/, function(response_type) {

    switch(response_type) {
        
        case 'successful':
            expect(this.current_response.status).to.satisfy(successResponse, 'Expected response to have status between 200 and 299');
            break;

        default:
            expect(this.current_response.status).to.satisfy(failureResponse, 'Expected response to have status between 300 and 600');
            break;

    }

});

When(/^the system finished the task "(.*)"$/, async function(task_description) {

    this.current_job_result = await utils.finishJobByDescription(
        task_description,
        //supply custom extra configuration if present
        _.isObject(this.job_config)? this.job_config : {});
});

const constModelMapping = {

    'RecipeOrderGroup': require('../../../config/model_constants').RECIPE_ORDER_GROUP_STATUSES,
    'InvestmentRun': require('../../../config/model_constants').INVESTMENT_RUN_STATUSES,
    'ExecutionOrder': require('../../../config/model_constants').EXECUTION_ORDER_STATUSES,
    'RecipeRun': require('../../../config/model_constants').RECIPE_RUN_STATUSES,
    'RecipeRunDeposit': require('../../../config/model_constants').RECIPE_RUN_DEPOSIT_STATUSES,
    'ColdStorageTransfer': require('../../../config/model_constants').COLD_STORAGE_ORDER_STATUSES,
    'RecipeOrder': require('../../../config/model_constants').RECIPE_ORDER_STATUSES
}

const get_model_status_value_for = (model_name, status_val) => {
    chai.assert.isDefined(constModelMapping[model_name], `Model name ${model_name} has no associated status mapping!`);
    const model_statuses = constModelMapping[model_name];
    //normalize any capitalization on status
    const status_word = to_model_name(status_val);
    chai.assert.isDefined(model_statuses[status_word], `Statuses of model ${model_name} dont have key for status ${status_word}!`);

    return model_statuses[status_word];
}

const to_model_name = (field) => _.upperFirst(_.camelCase(field));
const to_field_name = (field) => `${_.snakeCase(_.lowerCase(field))}`;
const to_context_name = (field, ctx_type = 'current') => `${ctx_type}_${to_field_name(field)}`;
const get_model_status_field_name = (model) => _.find(Object.keys(model.attributes), field_name => field_name.includes('status'));
const to_admin_list_view_fetch = (descriptor_plural) => `fetch${to_model_name(descriptor_plural)}ViewDataWithCount`;
const to_admin_entity_view_fetch = (model_descriptor) => `fetch${to_model_name(model_descriptor)}View`;

When(/^navigate to (\w*) (.*)$/, async function(status_val, object_type) {

    const model_name = to_model_name(object_type);
    const model = require('../../../models')[model_name];

    chai.assert.isDefined(model, `No model found for type ${model_name}!`);
    const status_value = get_model_status_value_for(model_name, status_val);
    //find right fieldname for status (first field with word status in it)
    const status_field_name = get_model_status_field_name(model);
    chai.assert.isNotNull(status_field_name, `Could not find field name containing 'status' for model ${model_name}`);
    //search for right instance
    const instance = await model.findOne({
        where: {
            [status_field_name]: status_value
        },
        //make sure to grab the newest one
        order: [
            ['id', 'DESC']
        ]
    })
    chai.assert.isNotNull(instance, `Could not find instance of model ${model_name} with status ${status_value}!`);
    //put model instance into the world, we have navigated to it.
    // put in both contexts in case we will compare history
    const ctx_prefixes = ['current', 'prev'];
    
    for (let ctx_prefix_idx in ctx_prefixes) {
        const context_field_name = to_context_name(model_name, ctx_prefixes[ctx_prefix_idx]);
        this[context_field_name] = instance;
        //duplicat status in standard field to simplify future universal lookups
        if (status_field_name != 'status') {
            this[context_field_name].status = this[context_field_name][status_field_name];
        }
    }
});

When(/view list of (.*)/, async function(descriptor_plural) {

    const adminViewService = this.adminViewService;
    chai.assert.isNotNull(adminViewService, 'World context did not contain admin view service!');
    const fetch_method = to_admin_list_view_fetch(descriptor_plural);

    //TODO: if upgrade to chai 4 happens - this can be replaced with isFunction(), chai 3 didnt support async function checks
    chai.assert.isDefined(adminViewService[fetch_method], `AdminViewService did not contain method ${fetch_method}!`);

    //to fetch exactly like FE, we sort by id desc
    const { data, total } = await adminViewService[fetch_method]({
        order: [
            ['id', 'DESC']
        ]
    })
    chai.assert.isAbove(total, 0, `Fetched records were empty! Create records before this step!`);
    chai.assert.isArray(data, 'Fetcher must return array of records!');

    this.view_data_list = data;
});

const admin_aliases = {
    'recipe run deposit': 'recipe deposit'
}

When(/view details of this (.*)/, async function(model_descriptor) {

    const adminViewService = this.adminViewService;
    chai.assert.isNotNull(adminViewService, 'World context did not contain admin view service!');

    const context_name = to_context_name(model_descriptor);
    chai.assert.isDefined(this[context_name], `Context doesnt have object at ${context_name}!`);

    const fetch_method = to_admin_entity_view_fetch(admin_aliases[model_descriptor] || model_descriptor);
    //TODO: if upgrade to chai 4 happens - this can be replaced with isFunction(), chai 3 didnt support async function checks
    chai.assert.isDefined(adminViewService[fetch_method], `AdminViewService did not contain method ${fetch_method}!`);

    const data = await adminViewService[fetch_method](this[context_name].id);
    chai.assert.isNotNull(data, `Nothing to fetch from admin method ${fetch_method} for id ${this[context_name].id}!`);

    //fudge data object into a view data list for check step
    this.view_data_list = [
        data
    ];
});

When('I provide a rationale', function () {

    const rationales = [
        'Random rational 1',
        'Random rational 2',
        'Random rational 3',
        'Random rational 4'
    ];

    this.current_rationale = _.get(World, '_current_scenario.pickle.name');

    if(!this.current_rationale) this.current_rationale = this.current_rationale = rationales[_.random(0, rationales.length - 1, false)];

});

When('I provide an empty rationale', function () {

    this.current_rationale = '         ';

});

/**
 * Universal step to spam an endpoint which is protected by a lock or a transactions
 * to avoid duplicate data in the database
 */
When(/^I trigger "(.*)" action multiple times concurrently$/, function(action_name){

    const { sequelize } = require('../../../models');
    const { Op } = sequelize;

    const max_attempts = 200;
    const default_transaction_error_1 = 'could not serialize access due to concurrent update';
    const default_transaction_error_2 = 'could not serialize access due to read/write dependencies among transactions';

    const action_map = {
        'start recipe run': local_world => {
            return {
                endpoint: `investments/${local_world.current_investment_run.id}/start_recipe_run`,
                method: 'post',
                request: {},
                errors: {
                    lock: [`Recipe Run is currently being generated for Investment Run with id ${local_world.current_investment_run.id}, please wait...`],
                    transaction: [ default_transaction_error_1, default_transaction_error_2 ],
                    duplicate: ['There is already recipe run pending approval']
                },
                check_with: { investment_run_id: local_world.current_investment_run.id },
                timeout: 15000
            }
        },
        'start investment run': local_world => {
            return {
                endpoint: `investments/create`,
                method: 'post',
                request: local_world.current_investment_run_details,
                errors: {
                    lock: ['An investment run is currently being created.'],
                    transaction: [ default_transaction_error_1, default_transaction_error_2 ],
                    duplicate: ['Investment run cannot be initiated as other investment runs are still in progress']
                },
                check_with: {
                    status: INVESTMENT_RUN_STATUSES.Initiated,
                    is_simulated: false
                },
                timeout: 12000
            }
        },
        'generate recipe run orders': local_world => {
            return {
                endpoint: `recipes/${local_world.current_recipe_run.id}/generate_orders`,
                method: 'post',
                request: {},
                errors: {
                    lock: [`Recipe Orders are currently being generated for Recipe Run with id ${local_world.current_recipe_run.id}. Please wait...`],
                    transaction: [ default_transaction_error_1, default_transaction_error_2 ],
                    duplicate: [`Recipe run ${local_world.current_recipe_run.id} already has a non-rejected orders group {number} with status ${RECIPE_ORDER_GROUP_STATUSES.Pending}, wont generate more!`]
                },
                check_with: {
                    approval_status: RECIPE_ORDER_GROUP_STATUSES.Pending,
                    recipe_run_id: local_world.current_recipe_run.id
                },
                timeout: 12000
            }
        },
        'create instrument': local_world => {
            const instrument_symbol = `${local_world.current_transaction_asset.symbol}/${local_world.current_quote_asset.symbol}`;
            return {
                endpoint: `instruments/create`,
                method: 'post',
                request: [
                    {
                        transaction_asset_id: local_world.current_transaction_asset.id,
                        quote_asset_id: local_world.current_quote_asset.id
                    },
                    {
                        quote_asset_id: local_world.current_transaction_asset.id,
                        transaction_asset_id: local_world.current_quote_asset.id
                    }
                ],
                request_selection: 'switch', //Optional. How the request will be sent. by default, the whole object is sent, but it can also be an array of multiple requests
                errors: {
                    lock: [`Instrument is already being created with those assets. Please wait...`],
                    transaction: [ 
                        `error occurred creating instrument {string} !: ${default_transaction_error_1}`, 
                        `error occurred creating instrument {string} !: ${default_transaction_error_2}` 
                    ],
                    duplicate: [
                        `error occurred creating instrument {string} !: Instrument {string} already exists!!`,
                        `error occurred creating instrument {string} !: Only one unique asset pair is allowed. Asset pair {string} and {string} already used in instrument {string}`
                    ]
                },
                check_with: {
                    [Op.or]: [
                        {
                            transaction_asset_id: local_world.current_transaction_asset.id,
                            quote_asset_id: local_world.current_quote_asset.id
                        },
                        {
                            quote_asset_id: local_world.current_transaction_asset.id,
                            transaction_asset_id: local_world.current_quote_asset.id
                        }
                    ]
                },
                timeout: 12000
            };
        },
        'add LCI cold storage account': local_world => {
            return {
                endpoint: `cold_storage/accounts/add`,
                method: 'post',
                request: {
                    strategy_type: STRATEGY_TYPES.LCI,
                    asset_id: local_world.current_asset.id,
                    custodian_id: local_world.current_custodian.id,
                    address: '3jkh12j3h213h12k3h1k2j3h1jk23h1jh231kh'
                },
                errors: {
                    lock: [`A cold storage account is currently being added with those selections. Please wait...`],
                    transaction: [ 
                        default_transaction_error_1, 
                        default_transaction_error_2 
                    ],
                    duplicate: [`Account with the same strategy, asset and custodian already exists`]
                },
                check_with: {
                    strategy_type: STRATEGY_TYPES.LCI,
                    asset_id: local_world.current_asset.id,
                    cold_storage_custodian_id: local_world.current_custodian.id
                },
                timeout: 12000
            };
        }
    };

    const action = action_map[action_name](this);
    expect(action, `Action "${action_map}" does not have mapping`).to.be.not.undefined;

    this.current_search_query = action.check_with || {};

    let current_attempt = 0;
    let completed_requests = 0;
    let lock_blocks = 0;
    let transaction_blocks = 0;
    let duplicate_blocks = 0;

    return new Promise((resolve, reject) => {
        /**
         * It seems that the transaction (with serialized isolation level) does not always create a row,
         * Thus it will not respond and the step will fail. Currently it is OK if some of the rows are not created at all (like recipe run)
         * as no rows is better than multiple duplicates. As long as the lock in the controller holds, it should respond correctly
         */
        let finished = false;
        let timeout = null;
        let timeouts_at = null;
        if(action.timeout) {
            timeouts_at = Date.now() + action.timeout;
            timeout = setTimeout(() => {
                finish();
            }, action.timeout);
        }

        let request_index = 0;
        while(current_attempt < max_attempts) {

            current_attempt++;

            let request = {};

            switch(action.request_selection) {

                case 'switch':
                    request = action.request[request_index];
                    request_index++;
                    if(request_index >= action.request.length) request_index = 0;
                    break;

                case 'random':
                    request = action.request[_.random(0, action.request.length - 1)];
                    break;

                case undefined:
                    request = action.request;
                    break;

                default:
                    return reject(`Unknown request selection type: ${action.request_selection}`);

            }

            chai
            .request(this.app)
            [action.method](`/v1/${action.endpoint}`)
            .set('Authorization', this.current_user.token)
            .send(request)
            .then(result => {

                completed_requests++;

                if(completed_requests >= max_attempts) return finish();
                
            })
            .catch(result => {
                
                completed_requests++;

                const error_message = _.get(result, 'response.body.error') || _.get(result, 'response.body');

                switch(true) {

                    case utils.matchErrors(action.errors.lock, error_message):
                        lock_blocks++;
                        break;

                    case utils.matchErrors(action.errors.duplicate, error_message):
                        duplicate_blocks++;
                        break;

                    case utils.matchErrors(action.errors.transaction, error_message):
                        transaction_blocks++;
                        break;

                    default:
                        return reject(`Received an unepected error: ${JSON.stringify(error_message)}`); 

                }

                if(completed_requests >= max_attempts) return finish();
                    
            });

        };

        function finish(){
            if(finished) return;
            finished = true;

            if(timeout) clearTimeout(timeout);

            World.print(`
                ENDPOINT SPAM COMPLETED:
                >Total requests sent: ${current_attempt},
                >Total requests completed: ${completed_requests},
                >Requests blocked by the lock: ${lock_blocks},
                >Requests blocked by the transaction: ${transaction_blocks},
                >Requests blocked by the duplicate check:${duplicate_blocks}
            `);

            return resolve();
        };

    });

});

Then(/^the (.*) status will remain unchanged/, async function(current_obj_type) {

    const context_name = to_context_name(current_obj_type, 'prev');
    const ctx_instance = this[context_name];
    chai.assert.isObject(ctx_instance, `Context did not have an object at field ${context_name}!`);

    //lookup the new status value of the instance
    const model_name = to_model_name(current_obj_type);
    const model = require('../../../models')[model_name];
    const fresh_instance = await model.findById(ctx_instance.id);
    chai.assert.isNotNull(fresh_instance, `Model ${model_name} has no instance with id ${ctx_instance.id}!`);
    const status_field_name = get_model_status_field_name(model);

    chai.assert.equal(fresh_instance[status_field_name], ctx_instance[status_field_name], `New fetched instance ${status_field_name} was different!`)
});

Then(/^the (.*) will have status (\w*)/, async function(current_obj_type, status_val) {

    const context_name = to_context_name(current_obj_type);
    const instance = this[context_name];
    chai.assert.isDefined(instance, `Context did not have an object at field ${context_name}!`);
    const status_value = get_model_status_value_for(to_model_name(current_obj_type), status_val);
    //value might be stale, try refetch
    if (status_value != instance.status) {
        const model_name = to_model_name(current_obj_type);
        const model = require('../../../models')[model_name];
        const fresh_instance = await model.findById(instance.id);
        chai.assert.isNotNull(fresh_instance, `Model ${model_name} has no instance with id ${instance.id}!`);

        const status_field_name = get_model_status_field_name(model);

        chai.assert.equal(fresh_instance[status_field_name], status_value, `${model_name} instance was supposed to have a '${status_field_name}' equal to ${status_val}(${status_value})!`)
    } else {
        chai.assert.equal(instance.status, status_value, `${context_name} instance was supposed to have a 'status' equal to ${status_val}(${status_value})!`)
    }
});

Then(/^this action was logged with (.*)/, async function(logged_property_expression) {

    const logged_property = to_field_name(logged_property_expression);
    const ActionLog = require('../../../models').ActionLog;
    chai.assert.isNotNull(this.check_log_id, `Context did not have check_log_id field! Fill that in during a step before action log gets checked!`);

    if (_.isArray(this.check_log_id) && this.check_log_id.length > 1) {
        const new_log_entries = await ActionLog.findAll({
            where: {
                [logged_property]: this.check_log_id
            },
            order: [
                ['timestamp', 'DESC']
            ],
            limit: this.check_log_id.length
        });

        chai.assert.isArray(new_log_entries, `Actions should have generated ${this.check_log_id.length} log entries with ${logged_property} of set ${this.check_log_id}!`);
        chai.assert.isAtLeast(new_log_entries.length, this.check_log_id.length, `Should have generated a log entry for every check id!`);
    } else {

    //find newest that satisfies
    const new_log_entry = await ActionLog.findOne({
        where: {
            [logged_property]: this.check_log_id
        },
        order: [
            ['timestamp', 'DESC']
        ]
    });

    chai.assert.isNotNull(new_log_entry, `Actions should have generated a log entry with ${logged_property} equal ${this.check_log_id}!`);
    }
});

Then(/the view detail (.*) is (.*)/, async function(field_name_descriptor, value_descriptor) {

    chai.assert.isArray(this.view_data_list, 'Context requires view data list for this step!');
    chai.assert.equal(this.view_data_list.length, 1, 'Context needs view data list of 1 item for this step!');

    const data_record = _.first(this.view_data_list);
    chai.assert.isNotNull(data_record, 'Data at index 0 was not present!');

    const field_name = to_field_name(field_name_descriptor);
    chai.assert.isDefined(data_record[field_name], `Field name ${field_name} did not correspond to valid data record field!`);
    chai.assert.isString(value_descriptor, `Supplied value descriptor ${value_descriptor} was not a string!`);

    let value_to_check = data_record[field_name];
    //ensure i18n presence when dealing with status
    if (field_name.includes('status')) {
        chai.assert.isDefined(this.i18n, 'Context did not have internationalization object, required for thsi step!');
        //if status is known value, might as well trasnalte it
        if (value_to_check != null) {
            value_to_check = _.get(this.i18n, value_to_check) || value_to_check;
        }
    }

    if (_.isString(value_to_check)) {
        value_to_check = value_to_check.trim();
    }
    //CASE 1: value needs to be unknown
    if (value_descriptor.trim() == 'unknown') {
        chai.assert.isTrue(_.isEmpty(value_to_check), `Record member ${field_name} was supposed to be null/undefined, got ${value_to_check}!`);
    } else {
        //CASE 2: value is defined
        const acceptable_values = value_descriptor.trim().split(' or ').map(value =>  value.trim());

        //CASE 2a: there is only 1 value to check against
        if (acceptable_values.length == 1) {
            chai.assert.equal(value_to_check, _.first(acceptable_values), `Record member ${field_name} was not eqaul to expected value!`);
        } else {
            //CASE 2b: there is a list of values to check against
            chai.assert.isTrue(acceptable_values.includes(value_to_check), `The data record ${field_name} member value ${value_to_check} was not in list of acceptable values ${acceptable_values}!`);
        }
    }
})

Then('I see data layout:', async function(raw_data_table) {

    const data_table = raw_data_table.hashes();
    chai.assert.isObject(this.i18n, 'No internationalization object in context, needed to check admin views!');
    chai.assert.isArray(this.view_data_list, 'Context should have current view list before this check');
    chai.assert.isArray(data_table, 'Poorly formatted data table not array!');
    chai.assert.equal(this.view_data_list.length, data_table.length, `Records show is different from example`);

    utils.compareViewTables.bind(this)(this.view_data_list, data_table);
});

Then('I see an empty table', function() {

    expect(this.view_data_list.length).to.equal(0, 'Expected an empty list/table');

});

Then(/^if I look at the (.*) (details|list|footer|logs)$/, function(data_name, data_type) {

    const { replaceArgs } = require('../../../utils/ActionLogUtil');

    let data = this[`current_${_.snakeCase(data_name)}_${data_type}`];

    expect(data, `Expected to look at ${data_name} ${data_type}`).to.be.not.undefined;

    switch(data_type) {

        case 'details':
            data = [ data ];
            break;
        
        case 'footer':
            data = _.fromPairs(data.map(d => {
                const template_string = _.get(this.i18n, d.template);
                const converted = replaceArgs(template_string, d.args)
                return [d.name, converted]
            }));
            data = [ data ];
            break;

        case 'logs':
            data = data.map(d => {
                return {
                    timestamp: d.timestamp,
                    entry: d.details
                };
            });
    }

    data.map(d => {
        for(let field in d) {
            if((/timestamp/.test(field) || /time/.test(field))&& !_.isNull(d[field])){
                d[field] = new Date(d[field]).toString().split('GMT')[0].trim();
            }
            else if(!isNaN(d[field]) && !_.isNull(d[field]) && !_.isDate(d[field]) && d[field] !== '') {
                d[field] = Decimal(d[field]).toDP(9).toString();
            }
        }
    });

    this.view_data_list = data;

});

Then(/^in the (.*) timeline card, I will see the following information:$/, function(card_name, table) {

    const formatted_card_name = _.snakeCase(card_name);

    expect(this.current_timeline, `Expected to have a timeline to validate`).to.be.not.undefined;

    const [ expected_values ] = table.hashes();

    for(let field in expected_values) {

        const expected_value = expected_values[field];
        const card = this.current_timeline[formatted_card_name];

        expect(card, `Expected to find timeline card "${card_name}" (${formatted_card_name})`).to.be.not.undefined;

        const timeline_value = utils.extractTimeLineField(formatted_card_name, card, field);

        if(!timeline_value && expected_value === '-') continue;

        expect(timeline_value).to.equal(expected_value, `Expected the ${_.startCase(card_name)} ${field} to match`);

    };

});

Then(/^only (\b(?:[a-z']*)(?:\s[a-z']*)*\b) (\b(?:[A-Z][a-z']*)(?:\s[A-Z][a-z']*)*\b) will be saved to the database$/, async function(amounts, model_name){

    const plural_map = {
        'Recipe Runs': 'RecipeRun',
        'Investment Runs': 'InvestmentRun',
        'Recipe Order Groups': 'RecipeOrderGroup',
        'Instruments': 'Instrument',
        'Cold Storage Accounts': 'ColdStorageAccount'
    };

    const allowed_numbers = utils.numberStringToArray(amounts);

    model_name = plural_map[model_name] || _.startCase(model_name);

    const model = require('../../../models')[model_name];
    expect(model, `Could not find database model with name "${model_name}"`).to.be.not.undefined;

    const result_count = await model.count({
        where: this.current_search_query
    });

    expect(allowed_numbers).includes(result_count, `Expected to find ${amounts} rows for ${model_name}, instead found ${result_count}`);

});


//called after scenarios where this tag is placed
//cleans out cached investmetn run if present
After('@investment_run_cache_cleanup', async function() {

    //delete investment run if present
    if (this.current_investment_run != null
        && _.isFunction(this.current_investment_run.destroy)) {
        await this.current_investment_run.destroy();
    }
});

//called after scenarios where this tag is placed
//cleans out cached execution orders if present
After('@execution_orders_cache_cleanup', async function() {
    //remove created execution orders
    if (this.current_execution_orders && 
        _.isArray(this.current_execution_orders)) {
            await require('../../../models').ExecutionOrder.destroy({
                where: {
                    id: _.map(this.current_execution_orders, 'id')
                }
            });
        }
});

After('@order_group_cache_cleanup', async function() {

    if(this.current_recipe_order_group) {

        const { RecipeOrderGroup } = require('../../../models');
        return RecipeOrderGroup.destroy({
            where: { id: this.current_recipe_order_group.id }
        });
    }

});

After('@restore_settings', function() {
    
    if(!_.isEmpty(World._default_settings)) SYSTEM_SETTINGS = _.clone(World._default_settings);

});

Before('@limit_to_MVP_exchanges', function() {

    const {
        sequelize,
        Exchange, 
        InstrumentLiquidityHistory, 
        InstrumentLiquidityRequirement ,
        InstrumentExchangeMapping
    } = require('../../../models');

    return sequelize.transaction(async transaction => {

        const exchanges = await Exchange.findAll({
            where: { name: non_mvp_exchanges.map(ex => ex.name) },
            transaction
        });

        expect(exchanges.length).to.be.lessThan(non_mvp_exchanges.length + 1, `Found more exchanges than needed. STOP`);
        const exchange_ids = exchanges.map(ex => ex.id);
        
        await InstrumentLiquidityHistory.destroy({ where: {
            exchange_id: exchange_ids
        }, transaction });
        await InstrumentLiquidityRequirement.destroy({ where: {
            exchange: exchange_ids
        }, transaction });
        await InstrumentExchangeMapping.destroy({ where: {
            exchange_id: exchange_ids
        }, transaction });

        return Exchange.destroy({
            where: { id: exchange_ids },
            transaction
        });

    });

});

After('@limit_to_MVP_exchanges', function() {

    const { Exchange } = require('../../../models');

    //Safety create
    return Promise.all(non_mvp_exchanges.map(exchange => {

        return Exchange.findCreateFind({
            where: exchange,
            defaults: exchange
        });

    }));

});

After('@whitelist_all_assets', function() {

    const { AssetStatusChange, sequelize } = require('../../../models');
    const { Op } = sequelize;

    return AssetStatusChange.destroy({
        where: {
            type: { [Op.ne]: INSTRUMENT_STATUS_CHANGES.Whitelisting }
        }
    });

});
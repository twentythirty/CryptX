const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { failureResponse, successResponse } = require('../support/assert');

const World = require('../support/global_world');
const utils = require('../support/step_helpers');

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

    this.current_job_result = await utils.finishJobByDescription(task_description);
});

const constModelMapping = {

    'RecipeOrderGroup': require('../../../config/model_constants').RECIPE_ORDER_GROUP_STATUSES,
    'InvestmentRun': require('../../../config/model_constants').INVESTMENT_RUN_STATUSES,
    'ExecutionOrder': require('../../../config/model_constants').EXECUTION_ORDER_STATUSES,
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
const to_context_name = (field, ctx_type = 'current') => `${ctx_type}_${_.snakeCase(_.lowerCase(field))}`;
const get_model_status_field_name = (model) => _.find(Object.keys(model.attributes), field_name => field_name.includes('status'));

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
        }
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

    chai.assert.equal(fresh_instance[status_field_name], ctx_instance[status_field_name], `New fetched instnace ${status_field_name} was different!`)
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
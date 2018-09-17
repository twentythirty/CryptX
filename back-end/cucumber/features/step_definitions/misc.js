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
const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { failureResponse, successResponse } = require('../support/assert');

const World = require('../support/global_world');

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
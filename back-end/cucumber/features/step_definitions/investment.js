const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

Given('some investment runs have been completed and there are currently ongoing ones', function() {
    
});
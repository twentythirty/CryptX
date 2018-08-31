const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const credentials = {
    username: null,
    password: null
}

Given('I know the Admin credentials', function() {
    credentials.username = process.env.ADMIN_EMAIL;
    credentials.password = process.env.ADMIN_PWD;

    expect(credentials.username).to.be.not.undefined;
    expect(credentials.password).to.be.not.undefined;

    this.worldLog('I am calling the world!');
})

When('I log onto CryptX as Admin', function() {
    return chai
        .request(this.app)
        .post("/v1/users/login")
        .send(credentials)
        .then(result => {   

            expect(result).to.have.status(200);
            expect(result.body.token).to.be.not.undefined;
            expect(result.body.user).to.an('object');

            this.token = result.body.token;
            this.user = result.body.user;

        });
})

Then('I should be logged in as the Admin', function() {
    expect(this.user.email).to.equal(credentials.username);
    expect(this.user.first_name).to.equal('Admin');
})

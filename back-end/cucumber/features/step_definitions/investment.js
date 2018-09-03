const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const investment_runs = [];

Given('there are no incomplete non simulated investment runs', function() {

    const { InvestmentRun, sequelize } = require('../../../models');
    const Op = sequelize.Op;
    
    return InvestmentRun.destroy({
        where: {
            is_simulated: false,
            status: {
              [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled
            }
        }
    });
    
});

When(/I create a new (.*) (.*) Investment Run/, function(simulated, type) {

    const investment_run_details = {
        strategy_type: STRATEGY_TYPES[type],
        is_simulated: (simulated === 'simulated'),
        deposit_usd: _.random(1000, 50000, false)
    };

    return chai
        .request(this.app)
        .post("/v1/investments/create")
        .set("Authorization", this.users.investment_manager.token)
        .send(investment_run_details)
        .then(result => {   
            
            expect(result).to.have.status(200);

            this.current_investment_run = investment_run_details;
            this.current_investment_run.id = result.body.investment_run.id;
        });
});

Then('the investment run information is saved to the database', function() {

    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.findById(this.current_investment_run.id, { raw: true }).then(investment_run => {

        expect(investment_run).to.be.not.null;

        //Compare the object from the database with one sent to the API
        expect(investment_run.strategy_type).to.equal(this.current_investment_run.strategy_type);
        expect(parseInt(investment_run.deposit_usd)).to.equal(this.current_investment_run.deposit_usd);
        expect(investment_run.is_simulated).to.equal(this.current_investment_run.is_simulated);

        this.current_investment_run = investment_run;

    });

});

Then(/the investment run status is (.*)/, function(status) {

    expect(this.current_investment_run.status).to.equal(INVESTMENT_RUN_STATUSES[status]);

});

Then('I am assigned as the user who created it', function() {

    expect(this.current_investment_run.user_created_id).to.equal(this.users.investment_manager.id);

});

Then('I can only create one real running investment run at the same time', function() {

    const investment_run_details = {
        strategy_type: _.random(0, 1, false) ? STRATEGY_TYPES.LCI : STRATEGY_TYPES.MCI, //It should reject despite which strategy type you choose
        is_simulated: false,
        deposit_usd: _.random(1000, 50000, false)
    };

    return chai
        .request(this.app)
        .post("/v1/investments/create")
        .set("Authorization", this.users.investment_manager.token)
        .send(investment_run_details)
        .catch(result => {   
            
            expect(result).to.have.status(422);

        });

})
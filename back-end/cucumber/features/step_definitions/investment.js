const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no investment runs in the system', function() {
    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.destroy({
        where: {}
    });
});

Given('there are no real investment runs in the system', function() {
    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.destroy({
        where: { is_simulated: false }
    });
});

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

Given(/there is a (.*) (.*) Investment Run created by an Investment Manager/, async function(simulated, type) {
    const { Asset, InvestmentRun, InvestmentAmount, sequelize } = require('../../../models');
    const { Op } = sequelize;

    let investment_run = await InvestmentRun.findOne({
        where: { 
            user_created_id: World.users.investment_manager.id,
            is_simulated: (simulated === 'simulated'),
            strategy_type: STRATEGY_TYPES[type]
        },
        raw: true
    });

    if(investment_run) {
        this.current_investment_run = investment_run;
        this.current_investment_run.amounts = await InvestmentAmount.findAll({
            where: { investment_run_id: investment_run.id }
        });
    }

    const assets = await Asset.findAll({
        where: { 
            [Op.or]: [{ is_deposit: true }, { is_base: true }]
        }   
    });

    const new_investment_run = {
        strategy_type: STRATEGY_TYPES[type],
        is_simulated: (simulated === 'simulated'),
        deposit_usd: _.random(1000, 50000, false),
        user_created_id: World.users.investment_manager.id,
        started_timestamp: new Date(),
        updated_timestamp: new Date()
    };

    const new_amounts = assets.map(asset => {
        return {
            amount: _.random(1000, 50000, false),
            asset_id: asset.id
        }
    });

    return sequelize.transaction(transaction => {

        return InvestmentRun.create(new_investment_run, { transaction }).then(investment_run => {

            this.current_investment_run = investment_run.toJSON();

            return InvestmentAmount.bulkCreate(new_amounts.map(amount => {

                return Object.assign(amount, { investment_run_id: investment_run.id });

            }), { transaction, returning: true }).then(amounts => {

                this.current_investment_run.amounts = amounts.map(amount => amount.toJSON());

            });
        });
    });
});

Given(/^the status of the Investment Run is (.*)$/, function(status) {
    
    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.update({ status: INVESTMENT_RUN_STATUSES[status] }, {
        where: { id: this.current_investment_run.id },
        limit: 1
    }).then(result => {
        this.current_investment_run.status = INVESTMENT_RUN_STATUSES[status];
    });

});

When(/^I create a new (.*) (.*) Investment Run$/, function(simulated, type) {

    const investment_run_details = {
        strategy_type: STRATEGY_TYPES[type],
        is_simulated: (simulated === 'simulated'),
        deposit_usd: _.random(1000, 50000, false)
    };

    return chai
        .request(this.app)
        .post('/v1/investments/create')
        .set('Authorization', World.current_user.token)
        .send(investment_run_details)
        .then(result => {   
            
            expect(result).to.have.status(200);

            this.current_investment_run = investment_run_details;
            this.current_investment_run.id = result.body.investment_run.id;
        })
        .catch(error => {
            this.error = error;
        });
});

When('I get the Investment Run by id', function() {
    return chai
        .request(this.app)
        .get(`/v1/investments/${this.current_investment_run.id}`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            expect(result).to.have.status(200);

            this.current_investment_run = result.body.investment_run;
        });
});

Then('the Investment Run information is saved to the database', function() {

    const { InvestmentRun, InvestmentAmount } = require('../../../models');

    return InvestmentRun.findById(this.current_investment_run.id, {
        include: InvestmentAmount
    }).then(investment_run => {

        expect(investment_run).to.be.not.null;

        //Compare the object from the database with one sent to the API
        expect(investment_run.strategy_type).to.equal(this.current_investment_run.strategy_type);

        for(let amount of investment_run.InvestmentAmounts) {

            const found_amount = this.current_investment_run.amounts.find(a => a.asset_id === amount.asset_id);

            expect(parseFloat(amount.amount)).to.equal(parseFloat(found_amount.amount));
            expect(amount.asset_id).text.equal(found_amount.asset_id);

        };

        expect(investment_run.is_simulated).to.equal(this.current_investment_run.is_simulated);
        
        expect(investment_run.started_timestamp).to.be.a('date');
        expect(investment_run.updated_timestamp).to.be.a('date');
        expect(investment_run.completed_timestamp).to.be.null;

        this.current_investment_run = investment_run.toJSON();
        this.current_investment_run.amounts = investment_run.InvestmentAmounts.map(a => a.toJSON());

    });

});

Then(/the Investment Run status is (.*)/, function(status) {

    expect(this.current_investment_run.status).to.equal(INVESTMENT_RUN_STATUSES[status]);

});

Then('I am assigned as the user who created it', function() {

    expect(this.current_investment_run.user_created_id).to.equal(World.current_user.id);

});

Then('I can only create one real running investment run at the same time', function() {

    const investment_run_details = {
        strategy_type: _.random(0, 1, false) ? STRATEGY_TYPES.LCI : STRATEGY_TYPES.MCI, //It should reject despite which strategy type you choose
        is_simulated: false,
        deposit_usd: _.random(1000, 50000, false)
    };

    return chai
        .request(this.app)
        .post('/v1/investments/create')
        .set('Authorization', World.current_user.token)
        .send(investment_run_details)
        .catch(result => {   
            
            expect(result).to.have.status(422);

        });

})

Then('I should see the Investment Run information', function() {

    expect(this.current_investment_run).to.be.an('object');

    ['id', 'started_timestamp', 'updated_timestamp', 'completed_timestamp', 'strategy_type', 'is_simulated', 'status', 'deposit_usd', 'user_created']
        .map(field => {
            expect(this.current_investment_run[field]).to.be.not.undefined;
        });
});

Then('the creators full name should match', function() {

    const full_name = `${World.users.investment_manager.first_name} ${World.users.investment_manager.last_name}`;

    expect(this.current_investment_run.user_created).to.equal(full_name);

});

Then('the Investment Run should be marked as simulated', function() {

    expect(this.current_investment_run.is_simulated).to.be.true;

});

Then('I should be blocked by the system for not having the right permissions', function() {

    expect(this.error).to.have.status(403);

});
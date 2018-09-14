const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('the system does not have none rejected Orders', function() {

    const { RecipeOrderGroup, sequelize } = require('../../../models');
    const { Op } = sequelize;

    return RecipeOrderGroup.destroy({
        where: {
            approval_status: { [Op.ne]: RECIPE_ORDER_STATUSES.Rejected },
            recipe_run_id: this.current_recipe_run.id
        }
    });

});

When('I call the API to generate Orders for the Approved Recipe Run', function() {

    return chai
        .request(this.app)
        .post(`/v1/recipes/${this.current_recipe_run.id}/generate_orders`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            this.current_response = result;

            this.current_recipe_orders = result.body;

        })
        .catch(error => {
            
            this.current_response = error;

        })

});

Then('a new Recipe Group is created with the status Pending', async function() {

    const { RecipeOrderGroup, sequelize } = require('../../../models');

    const group = await RecipeOrderGroup.findOne({
        where: { recipe_run_id: this.current_recipe_run.id }
    });

    expect(group).to.be.not.null;

    expect(group.created_timestamp).to.be.a('date');
    expect(group.approval_status).to.equal(RECIPE_ORDER_GROUP_STATUSES.Pending);

    this.current_recipe_order_group = group;

});

Then('a Recipe Order is created for each Recipe Run Detail', async function() {
    
    const { RecipeOrder, RecipeRunDetail, Instrument, Asset } = require('../../../models'); 

    const [ orders, details, base_assets ] = await Promise.all([
        RecipeOrder.findAll({
            where: { recipe_order_group_id: this.current_recipe_order_group.id },
            include: Instrument
        }),
        RecipeRunDetail.findAll({
            where: { recipe_run_id: this.current_recipe_run.id }
        }),
        Asset.findAll({
            where: { is_base: true },
            raw: true
        })
    ]);

    expect(orders.length).to.equal(details.length);

    const base_asset_ids = base_assets.map(asset => asset.id);

    for(let order of orders) {

        const matching_detail = details.find(detail => {
            return (
                detail.target_exchange_id === order.target_exchange_id &&
                detail.quote_asset_id === order.Instrument.quote_asset_id &&
                detail.transaction_asset_id === order.Instrument.transaction_asset_id
            );
        });

        expect(matching_detail).to.be.not.undefined;

        if(base_asset_ids.includes(order.Instrument.quote_asset_id)) expect(order.side).to.equal(ORDER_SIDES.Buy);
        else expect(order.side).to.equal(ORDER_SIDES.Sell);

    }

    this.current_recipe_orders = orders;

});

Then('the Recipe Orders have the status Pending', function() {

    for(let order of this.current_recipe_orders) {

        expect(order.status).to.equal(RECIPE_ORDER_STATUSES.Pending);

    }

});

Then('the system won\'t allow me to generate Recipe Orders while this group is not Rejected', function() {

    return chai
        .request(this.app)
        .post(`/v1/recipes/${this.current_recipe_run.id}/generate_orders`)
        .set('Authorization', World.current_user.token)
        .catch(result => {
            
            expect(result).to.have.status(422);

            expect(result.response.body.error).to.match(/^Recipe run (.*) already has a non-rejected orders group (.*) with status (.*), wont generate more!$/);

        })

});

Then('I should see an error message describing that there are Pending Deposits', function() {

    const error_message = this.current_response.response.body.error;

    expect(error_message).to.match(/(.*) incomplete deposits found: (\d+)(,\s*\d+)*!/g);

});

Then('I should see an error message describing that Deposits have invalid values', function() {

    const error_message = this.current_response.response.body.error;

    expect(error_message).to.match(/Deposit info: {(.*)}/g);

});
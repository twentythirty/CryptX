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

Given(/^the system has Recipe Order with status (.*) on (.*)$/g, async function(status, exchange_name) {

    const { RecipeOrderGroup, RecipeOrder, Exchange, Instrument, InstrumentExchangeMapping, Asset, sequelize } = require('../../../models');
    const CCXTUtil = require('../../../utils/CCXTUtils');

    const [ exchange, base_assets ] = await Promise.all([
        Exchange.findOne({
            where: { name: exchange_name }
        }),
        Asset.findAll({
            where: { is_base: true }
        })
    ])

    const mapping = await InstrumentExchangeMapping.findOne({
        where: { exchange_id: exchange.id },
        include: {
            model: Instrument,
            required: true,
            where: { quote_asset_id: base_assets.map(asset => asset.id) }
        }
    });
    
    const connector = await CCXTUtil.getConnector(exchange.api_id);

    const amount_limits = _.get(connector, `markets.${mapping.external_instrument_id}.limits.amount`);

    return sequelize.transaction(transaction => {

        return RecipeOrderGroup.create({
            created_timestamp: new Date(),
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved,
            approval_comment: 'it\'s all good'
        }, { transaction }).then(group => {

            return RecipeOrder.create({
                instrument_id: mapping.Instrument.id,
                price: _.random(0.0001, 0.1, true),
                quantity: amount_limits.max,
                side: ORDER_SIDES.Buy,
                status: RECIPE_ORDER_STATUSES[status],
                target_exchange_id: exchange.id,
                recipe_order_group_id: group.id
            }, { transaction }).then(order => {

                this.current_recipe_order = order;

            });

        });

    });

});

Given('the Order is partially filled by a few FullyFilled ExecutionOrders', async function() {

    const { ExecutionOrder, ExecutionOrderFill, sequelize } = require('../../../models');

    const safe_amount = parseFloat(this.current_recipe_order.quantity) / 2;

    const fill_count = _.random(5, 10, false);

    return sequelize.transaction(transaction => {

        return ExecutionOrder.create({
            placed_timestamp: new Date(),
            completed_timestamp: new Date(),
            exchange_id: this.current_recipe_order.target_exchange_id,
            external_identifier: 'jk4h5kj34h5k3h5j3hk',
            failed_attempts: 0,
            fee: (parseFloat(this.current_recipe_order.price) / _.random(98, 100, false)),
            instrument_id: this.current_recipe_order.instrument_id,
            price: this.current_recipe_order.price,
            recipe_order_id: this.current_recipe_order.id,
            side: this.current_recipe_order.side,
            status: EXECUTION_ORDER_STATUSES.FullyFilled,
            total_quantity: safe_amount,
            type: EXECUTION_ORDER_TYPES.Market
        }, { transaction }).then(execution_order => {

            let fills = [];

            for(let i = 0; i < fill_count; i++) {

                const approximate_quantity = parseFloat(execution_order.total_quantity) / fill_count;
                const approximate_fee = parseFloat(execution_order.fee) / fill_count;

                fills.push({
                    execution_order_id: execution_order.id,
                    external_identifier: '4762387426478362',
                    fee: approximate_fee,
                    price: execution_order.price,
                    quantity: approximate_quantity,
                    timestamp: new Date()
                });
            }

            return ExecutionOrderFill.bulkCreate(fills, { transaction });

        });

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

When('the system finished the task "generate execution orders"', function() {

    const job = require('../../../jobs/exec-order-generator');
    const models = require('../../../models');
    const config = { models };

    return job.JOB_BODY(config, console.log);

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
const {
    Given,
    When,
    Then
} = require('cucumber');
const chai = require('chai');
const {
    expect
} = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there is a recipe order group with status Pending', {
    timeout: 15000
}, async function () {
    const orderService = require('../../../services/OrdersService');
    const generated_orders = await orderService.generateApproveRecipeOrders(this.current_recipe_run.id);
    this.current_generated_orders = generated_orders;
});

Given('one of the orders is missing their CCXT mapping', async function () {

    const models = require('../../../models');
    
    chai.assert.isArray(this.current_generated_orders, 'Generated orders array not present in World!');
    //Sometimes it would select an array object out of bounds as length is greater than last index by 1
    const random_idx = _.random(0, this.current_generated_orders.length - 1, false);
    const new_order = this.current_generated_orders[random_idx];
    chai.assert.isObject(new_order, 'Did not find any Pending Recipe Orders to tamper with!');

    const Instrument = models.Instrument;
    const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
    const mapped_instruments = await InstrumentExchangeMapping.findAll({
        include: {
            model: Instrument,
            required: true
        }
    });

    let empty_instrument = await Instrument.findOne({
        where: {
            id: {
                [models.Sequelize.Op.notIn]: _.map(mapped_instruments, 'instrument_id')
            }
        }
    });
    if (empty_instrument == null) {
        const instrument = mapped_instruments[_.random(0, mapped_instruments.length - 1, false)].Instrument;
        //no unmapped instruments, lets create one
        let created = false;
        [empty_instrument, created] = await Instrument.findCreateFind({
            defaults: {
                symbol: 'TEST',
                transaction_asset_id: instrument.transaction_asset_id,
                quote_asset_id: instrument.quote_asset_id
            },
            where: {
                symbol: 'TEST'
            }
        })
    }
    //store params for later assert
    this.current_bad_instrument = empty_instrument;
    this.current_order_exchange = await new_order.getTarget_exchange();
    //change order instrument
    new_order.instrument_id = empty_instrument.id
    await new_order.save()
});

Given(/^the recipe run does not have recipe order group with status (.*)$/, function (status) {

    const {
        RecipeOrderGroup,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    return RecipeOrderGroup.destroy({
        where: {
            approval_status: RECIPE_ORDER_GROUP_STATUSES[status]
        }
    });

});

Given(/^the system has Recipe Order with status (.*) on (.*)$/g, async function (status, exchange_name) {

    const {
        RecipeOrderGroup,
        RecipeOrder,
        Exchange,
        Instrument,
        InstrumentExchangeMapping,
        Asset,
        sequelize
    } = require('../../../models');
    const CCXTUtil = require('../../../utils/CCXTUtils');

    const [exchange, base_assets] = await Promise.all([
        Exchange.findOne({
            where: {
                name: exchange_name
            }
        }),
        Asset.findAll({
            where: {
                is_base: true
            }
        })
    ])

    const mapping = await InstrumentExchangeMapping.findOne({
        where: {
            exchange_id: exchange.id
        },
        include: {
            model: Instrument,
            required: true,
            where: {
                quote_asset_id: base_assets.map(asset => asset.id)
            }
        }
    });

    const connector = await CCXTUtil.getConnector(exchange.api_id);

    const amount_limits = _.get(connector, `markets.${mapping.external_instrument_id}.limits.amount`);

    return sequelize.transaction(transaction => {

        return RecipeOrderGroup.create({
            created_timestamp: new Date(),
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved,
            approval_comment: 'it\'s all good'
        }, {
            transaction
        }).then(group => {

            return RecipeOrder.create({
                instrument_id: mapping.Instrument.id,
                price: _.random(0.0001, 0.1, true),
                quantity: amount_limits.max,
                side: ORDER_SIDES.Buy,
                status: RECIPE_ORDER_STATUSES[status],
                target_exchange_id: exchange.id,
                recipe_order_group_id: group.id
            }, {
                transaction
            }).then(order => {

                this.current_recipe_order = order;

            });

        });

    });

});

Given(/^the Order is (.*) filled by a FullyFilled ExecutionOrder$/, async function (amount) {

    const {
        ExecutionOrder,
        ExecutionOrderFill,
        sequelize
    } = require('../../../models');

    let total_quantity = 0;

    switch (amount) {

        case 'partially':
            total_quantity = parseFloat(this.current_recipe_order.quantity) / 2;
            break;

        case 'fully':
        default:
            total_quantity = parseFloat(this.current_recipe_order.quantity);
            break;

    }

    const fill_count = 10;

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
            total_quantity: total_quantity,
            type: EXECUTION_ORDER_TYPES.Market
        }, {
            transaction
        }).then(execution_order => {

            let fills = [];

            for (let i = 0; i < fill_count; i++) {

                const approximate_quantity = Decimal(execution_order.total_quantity).div(fill_count).toString();
                const approximate_fee = Decimal(execution_order.fee).div(fill_count).toString();

                fills.push({
                    execution_order_id: execution_order.id,
                    external_identifier: '4762387426478362',
                    fee: approximate_fee,
                    price: execution_order.price,
                    quantity: approximate_quantity,
                    timestamp: new Date()
                });
            }

            return ExecutionOrderFill.bulkCreate(fills, {
                transaction
            });

        });

    });

});

Given('the Recipe Order has unfilled quantity above ccxt requirement', function () {

    const {
        ExecutionOrder,
        ExecutionOrderFill,
        sequelize
    } = require('../../../models');

    /**
     * Considering the recipe order is created with exchange max limit, it should not be below min limit
     * if we take half of it
     */
    let total_quantity = parseFloat(this.current_recipe_order.quantity) / 2;

    const fill_count = 10;

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
            total_quantity: total_quantity,
            type: EXECUTION_ORDER_TYPES.Market
        }, {
            transaction
        }).then(execution_order => {

            let fills = [];

            for (let i = 0; i < fill_count; i++) {

                const approximate_quantity = Decimal(execution_order.total_quantity).div(fill_count).toString();
                const approximate_fee = Decimal(execution_order.fee).div(fill_count).toString();

                fills.push({
                    execution_order_id: execution_order.id,
                    external_identifier: '4762387426478362',
                    fee: approximate_fee,
                    price: execution_order.price,
                    quantity: approximate_quantity,
                    timestamp: new Date()
                });
            }

            return ExecutionOrderFill.bulkCreate(fills, {
                transaction
            });

        });

    });

});

Given('the Order remaining amount is not within exchange minimum amount limits', async function () {

    const {
        ExecutionOrder,
        ExecutionOrderFill,
        Exchange,
        InstrumentExchangeMapping,
        Instrument,
        sequelize
    } = require('../../../models');
    const CCXTUtil = require('../../../utils/CCXTUtils');

    const exchange = await Exchange.findById(this.current_recipe_order.target_exchange_id);

    const mapping = await InstrumentExchangeMapping.findOne({
        where: {
            exchange_id: exchange.id
        },
        include: {
            model: Instrument,
            required: true,
            where: {
                id: this.current_recipe_order.instrument_id
            }
        }
    });

    const connector = await CCXTUtil.getConnector(exchange.api_id);

    const amount_limits = _.get(connector, `markets.${mapping.external_instrument_id}.limits.amount`);

    const total_quantity = Decimal(this.current_recipe_order.quantity).minus(Decimal(amount_limits.min).div(2)).toString();

    const fill_count = 1;

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
            total_quantity: total_quantity,
            type: EXECUTION_ORDER_TYPES.Market
        }, {
            transaction
        }).then(execution_order => {

            let fills = [];

            for (let i = 0; i < fill_count; i++) {

                const approximate_quantity = Decimal(execution_order.total_quantity).div(fill_count).toString();
                const approximate_fee = Decimal(execution_order.fee).div(fill_count).toString();

                fills.push({
                    execution_order_id: execution_order.id,
                    external_identifier: '4762387426478362',
                    fee: approximate_fee,
                    price: execution_order.price,
                    quantity: approximate_quantity,
                    timestamp: new Date()
                });
            }

            return ExecutionOrderFill.bulkCreate(fills, {
                transaction
            });

        });

    });

});

When('I generate new Orders for the Approved Recipe Run', {
    timeout: 15000
}, function () {

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

When(/^(.*) the order group with a rationale/, {
    timeout: 15000
}, async function (action) {

    const orderService = require('../../../services/OrdersService');

    let new_status = _.toLower(action) == 'approve' ? RECIPE_ORDER_GROUP_STATUSES.Approved : RECIPE_ORDER_GROUP_STATUSES.Rejected;

    //perform approval
    const [err, result] = await to(orderService.changeRecipeOrderGroupStatus(
        this.current_user.id,
        this.current_recipe_order_group.id,
        new_status,
        `Testing ${action}`
    ));

    //preserve error for future steps, if any
    if (err != null) {
        this.current_recipe_order_group_status_change_error = err;
    }

    //refetch relevant info into world after status change to check later
    this.current_recipe_order_group = await require('../../../models').RecipeOrderGroup.findById(this.current_recipe_order_group.id);
    //account for lack of relevant field name
    this.current_recipe_order_group.status = this.current_recipe_order_group.approval_status;
    //move investment run to also provide history
    this.prev_investment_run = this.current_investment_run;
    this.current_investment_run = await require('../../../models').InvestmentRun.findById(this.current_investment_run.id);
});


Then('a new Recipe Group is created with the status Pending', async function () {

    const {
        RecipeOrderGroup,
        sequelize
    } = require('../../../models');

    const group = await RecipeOrderGroup.findOne({
        where: {
            recipe_run_id: this.current_recipe_run.id
        }
    });

    expect(group, 'Expected to find the new Recipe order group').to.be.not.null;

    expect(group.created_timestamp).to.be.a('date', 'Expected the orer group to have a created timestamp as a date');
    expect(group.approval_status).to.equal(RECIPE_ORDER_GROUP_STATUSES.Pending, 'Expected the order group to have status "Pending"');

    this.current_recipe_order_group = group;

});

Then('a Recipe Order is created for each Recipe Run Detail', async function () {

    const {
        RecipeOrder,
        RecipeRunDetail,
        Instrument,
        Asset
    } = require('../../../models');

    const [orders, details, base_assets] = await Promise.all([
        RecipeOrder.findAll({
            where: {
                recipe_order_group_id: this.current_recipe_order_group.id
            },
            include: Instrument
        }),
        RecipeRunDetail.findAll({
            where: {
                recipe_run_id: this.current_recipe_run.id
            }
        }),
        Asset.findAll({
            where: {
                is_base: true
            },
            raw: true
        })
    ]);

    expect(orders.length).to.equal(details.length, 'Expected the number of orders to equal the number of recipe run details');

    const base_asset_ids = base_assets.map(asset => asset.id);

    for (let order of orders) {

        const matching_detail = details.find(detail => {
            return (
                detail.target_exchange_id === order.target_exchange_id &&
                detail.quote_asset_id === order.Instrument.quote_asset_id &&
                detail.transaction_asset_id === order.Instrument.transaction_asset_id
            );
        });

        expect(matching_detail, 'Expected to find a matching recipe run detail forthe order').to.be.not.undefined;

        if (base_asset_ids.includes(order.Instrument.quote_asset_id)) expect(order.side).to.equal(ORDER_SIDES.Buy, 'Expected the order to be a "BUY" type');
        else expect(order.side).to.equal(ORDER_SIDES.Sell, 'Expected the order to be a "SELL" type');

    }

    this.current_recipe_orders = orders;

});

Then('the Recipe Orders have the status Pending', function () {

    for (let order of this.current_recipe_orders) {

        expect(order.status).to.equal(RECIPE_ORDER_STATUSES.Pending, 'Expected the orders to have status Pending');

    }

});

Then(/^all orders in the group will have status (.*)$/, async function (status) {

    chai.assert.isDefined(this.current_recipe_order_group, 'No group defined in context!');

    const orders_of_group = await this.current_recipe_order_group.getRecipeOrders();
    //expect some orders in that group
    chai.expect(orders_of_group.length).to.be.at.least(1, 'Recipe order group is empty!');
    chai.assert.isDefined(RECIPE_ORDER_STATUSES[status], `No valid recipe order status for word ${status}`);
    const needed_status = RECIPE_ORDER_STATUSES[status];
    _.forEach(orders_of_group, order => {
        chai.assert.equal(order.status, needed_status, `group order ${order.id} does not have status ${needed_status}`);
    })
});

Then('all orders in the group statuses will remain unchanged', async function() {
    
    chai.assert.isArray(this.current_generated_orders, 'No generated orders defined in context!');

    const fresh_orders_lookup = _.keyBy(await require('../../../models').RecipeOrder.findAll({
        where: {
            id: _.map(this.current_generated_orders, 'id')
        }
    }), recipe_order => recipe_order.id);

    for (let ctx_order_idx in this.current_generated_orders) {
        const ctx_order = this.current_generated_orders[ctx_order_idx];
        chai.assert.isObject(fresh_orders_lookup[ctx_order.id], `Recipe order for id ${ctx_order.id} not found in DB!`)
        chai.assert.equal(ctx_order.status, fresh_orders_lookup[ctx_order.id].status, `Order ${ctx_order.id} status changed!`)
    }
});

Then('the approval fails with an error message including mapping and exchange', function () {

    //there should have been an error saved
    chai.assert.isDefined(this.current_recipe_order_group_status_change_error, 'No error saved after recipe order group status changed!');

    const message = _.toLower(this.current_recipe_order_group_status_change_error.message);
    chai.assert.include(message, 'no mapping found', 'Error did not mention its about missing a mapping!');
    chai.assert.isObject(this.current_bad_instrument, 'No instrument saved as bad for recipe!');

    const instrument = this.current_bad_instrument;
    chai.assert.include(message, _.toLower(instrument.symbol), `Bad instrument symbol ${instrument.symbol} wasnt mentioned in the error!`);
    chai.assert.isObject(this.current_order_exchange, 'No exchange persisted for recipe orders!');
    chai.assert.include(message, _.toLower(this.current_order_exchange.name), `Exchange name ${this.current_order_exchange.name} not mnetioned in error!`)

});

Then('the system won\'t allow me to generate Recipe Orders while this group is not Rejected', function () {

    return chai
        .request(this.app)
        .post(`/v1/recipes/${this.current_recipe_run.id}/generate_orders`)
        .set('Authorization', World.current_user.token)
        .catch(result => {

            expect(result).to.have.status(422);

            expect(result.response.body.error).to.match(/^Recipe run (.*) already has a non-rejected orders group (.*) with status (.*), wont generate more!$/);

        })

});

Then('I can generate another order group', {
    timeout: 15000
}, async function() {

    const orderService = require('../../../services/OrdersService');
    const [err, generated_orders] = await to(orderService.generateApproveRecipeOrders(this.current_recipe_run.id));

    chai.assert.isNull(err, 'There wasnt supposed ot be an error trying to generate anohter recpe order group!');
});

Then('I should see an error message describing that there are Pending Deposits', function () {

    expect(this.current_response).to.have.status(422);

    const error_message = this.current_response.response.body.error;

    expect(error_message).to.match(/(.*) incomplete deposits found: (\d+)(,\s*\d+)*!/g, 'Expected the error message to contain a list of incomplete deposits');

});

Then('I should see an error message describing that Deposits have invalid values', function () {

    expect(this.current_response).to.have.status(422);

    const error_message = this.current_response.response.body.error;

    expect(error_message).to.match(/Deposit info: {(.*)}/g, 'Expected to receive a deposit info report which had faulty values');

});

Then(/^the task will skip the Recipe Order due to (.*)$/, function (reason) {

    const reason_mapping = {
        'Order was already filled': {
            status: JOB_RESULT_STATUSES.Skipped,
            step: '3B'
        },
        'next total being not within limits': {
            status: JOB_RESULT_STATUSES.Skipped,
            step: '4C'
        }
    };

    const matching_result = this.current_job_result.find(res => res.instance.id === this.current_recipe_order.id);

    expect(matching_result, 'Expected to find a matching result of the for the order').to.be.not.undefined;

    expect(matching_result.status).to.equal(reason_mapping[reason].status, 'Expected the status of the job cycle to match');
    expect(matching_result.step).to.equal(reason_mapping[reason].step, 'Expected the job to stop at a certain step');

});

Then('no Orders were generated for the Recipe Run', async function () {

    const {
        RecipeOrderGroup
    } = require('../../../models');

    const order_group = await RecipeOrderGroup.findOne({
        where: {
            recipe_run_id: this.current_recipe_run.id
        }
    });

    expect(order_group, 'Expected not to find any new orders in the database').to.be.null;

});
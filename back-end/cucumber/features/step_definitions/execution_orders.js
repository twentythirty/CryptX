const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const { nullOrNumber, greaterThanOrEqual, lessThanOrEqual } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no Execution Orders in the system', function() {

    const { ExecutionOrder } = require('../../../models');

    return ExecutionOrder.destroy({
        where: {}
    });

});

Given(/^there are (.*) (.*) Execution Orders for (.*)$/, async function(amount, status, exchange_name) {

    amount = parseInt(amount);

    const { ExecutionOrder, Exchange, Instrument } = require('../../../models');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    const exchange = await Exchange.findOne({
        where: { name: exchange_name }
    });

    const execution_order_count = await ExecutionOrder.count({
        where: {
            exchange_id: exchange.id,
            status: EXECUTION_ORDER_STATUSES[status]
        }
    });

    if(execution_order_count >= amount) return;

    const connector = await ccxtUtil.getConnector(exchange.api_id);

    const markets = _.uniq(Object.keys(connector.markets));

    const instruments = await Instrument.findAll({
        where: { symbol: markets.splice(_.random(0, amount - 1, false), markets.length - amount - 1) },
        raw: true,
        limit: amount
    });

    let new_execution_orders = [];

    for(let i = 0; i < amount; i++) {

        new_execution_orders.push({
            exchange_id: exchange.id,
            instrument_id: instruments[i].id,
            side: ORDER_SIDES.Buy,
            status: EXECUTION_ORDER_STATUSES[status],
            type: EXECUTION_ORDER_TYPES.Market,
            total_quantity: _.random(1, 20, true),
            failed_attempts: 0
        });
        
    }
    
    new_execution_orders = await ExecutionOrder.bulkCreate(new_execution_orders, {
        returning: true
    });

    this.current_execution_orders = new_execution_orders;

    return;

});

Given('the Pending Execution Orders are placed on the exchanges', async function() {

    const { ExecutionOrder, Exchange, Instrument } = require('../../../models');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    const pending_orders = await ExecutionOrder.findAll({
        where: {
            external_identifier: null,
            status: EXECUTION_ORDER_STATUSES.Pending
        },
        include: Instrument
    });

    const orders_by_exchange = _.groupBy(pending_orders, 'exchange_id');

    return Promise.all(_.map(orders_by_exchange, async (execution_orders, exchange_id) => {

        exchange_id = parseInt(exchange_id);

        const connector = await ccxtUtil.getConnector(exchange_id);

        return Promise.all(_.map(execution_orders, async execution_order => {

            const created_order = await connector.createMarketOrder(execution_order.Instrument.symbol, 'buy', execution_order);

            execution_order.external_identifier = created_order.id;
            execution_order.price = created_order.price;
            execution_order.placed_timestamp = created_order.datetime;
            execution_order.status = EXECUTION_ORDER_STATUSES.InProgress;
            
            return execution_order.save();

        }));

    }))

});

When('the FETCH_EXEC_OR_FILLS job runs until all of the orders are filled', async function() {

    const models = require('../../../models');
    const job = require('../../../jobs/exec-order-fill-fetcher');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    const { ExecutionOrder } = models;

    const config = {
        models
    };

    let execution_orders = this.current_execution_orders;

    if(!execution_orders) execution_orders = await ExecutionOrder.findAll({
        where: {
            status: EXECUTION_ORDER_STATUSES.InProgress
        }
    });

    const connectors = await Promise.all(_.uniq(_.map(execution_orders, 'exchange_id')).map(exchange_id => {
        return ccxtUtil.getConnector(exchange_id);
    }));

    let tolerance = 0;

    while(tolerance < 50) {
        tolerance++;

        for(let connector of connectors) connector.simulateTrades({
            rate: 5,
            multiple_trade_chance: 75
        });

        await job.JOB_BODY(config, console.log);

        const unfinished_order_count = await ExecutionOrder.count({
            where: { status: EXECUTION_ORDER_STATUSES.InProgress }
        });

        if(unfinished_order_count === 0) break;

    }

});

Then('Execution Order Fills are saved to the database', async function() {

    const { ExecutionOrder, ExecutionOrderFill } = require('../../../models');

    const [ execution_orders, fills ] = await Promise.all([
        ExecutionOrder.findAll({ raw: true }),
        ExecutionOrderFill.findAll({ raw: true })
    ]);

    for(let order of execution_orders) {

        const order_fills = fills.filter(fill => fill.execution_order_id === order.id);

        const expected_total_quantity = order_fills.reduce((prev, current) => {
            return prev = prev + parseFloat(current.quantity)
        }, 0);

        //For now lets round up the numbers, as js float may not be exactly accurate
        expect(parseFloat(_.round(order.total_quantity, 12))).to.equal(_.round(expected_total_quantity, 12), 'Expected fills total sum to equal to execution roder total quantity');

        const expected_fee = order_fills.reduce((prev, current) => {
            return prev = prev + parseFloat(current.fee)
        }, 0);

        expect(parseFloat(_.round(order.fee, 12))).to.equal(_.round(expected_fee, 12), 'Expected the execution order fee to equal sum of fill fees');

        const expected_order_price = order_fills.reduce((prev, current) => {
            return prev = prev + parseFloat(current.price)
        }, 0) / (order_fills.length);

        expect(parseFloat(_.round(order.price, 12))).to.equal(_.round(expected_order_price, 12), 'Expected the price to equalthe average price of fills');
    }

});

Then('the Execution Order Fills have matching fee Asset ids and symbols', async function() {

    const { Asset, ExecutionOrderFill } = require('../../../models');

    const fills = await ExecutionOrderFill.findAll({ raw: true });

    const assets = await Asset.findAll({
        where: { id: fills.map(fill => fill.fee_asset_id) }
    });

    expect(asset.length).to.be.greaterThan(0, 'Expected to find matching fee assets for fills');
    
    for(let fill of fills) {

        const asset = assets.find(a => a.id === fill.fee_asset_id);

        expect(fill.fee_asset_symbol).to.equal(asset.symbol, 'Expected to have matching fee asset symbols for fills');

    }

});

Then('The Execution Orders statuses become FullyFilled', async function () {

    const { ExecutionOrder } = require('../../../models');

    const execution_orders = await ExecutionOrder.findAll();

    for(let order of execution_orders) expect(order.status).to.equal(EXECUTION_ORDER_STATUSES.FullyFilled, 'Expected the Execution order to be FullyFilled');

});

Then('a new Execution Order is saved to the database', async function() {

    const { ExecutionOrder, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const execution_order = await ExecutionOrder.findOne({
        where: { recipe_order_id: this.current_recipe_order.id, status: { [Op.ne]: EXECUTION_ORDER_STATUSES.FullyFilled } }
    });

    this.current_execution_order = execution_order;

});

Then('the total quantity will be within exchange limits', async function() {

    const { Instrument, InstrumentExchangeMapping } = require('../../../models');
    const CCXTUtils = require('../../../utils/CCXTUtils');

    const connector = await CCXTUtils.getConnector(this.current_execution_order.exchange_id);

    const instrument = await Instrument.findById(this.current_execution_order.instrument_id, {
        include: {
            model: InstrumentExchangeMapping,
            where: { exchange_id: this.current_execution_order.exchange_id },
            limit: 1
        }
    });

    const amount_limits = _.get(connector, `markets.${instrument.InstrumentExchangeMappings[0].external_instrument_id}.limits.amount`);
    const calculated_quantity = parseFloat(this.current_execution_order.total_quantity);

    expect(calculated_quantity).to.satisfy(greaterThanOrEqual(amount_limits.min), 'Expected the calculated total quantity of the execution order to be greater than the min amount limit of exchange');
    expect(calculated_quantity).to.satisfy(lessThanOrEqual(amount_limits.max), 'Expected the calculated total quantity of the execution order to be less than the max amount limit of exchange');

});

Then('the initial price will not be set', function() {
    
    /**
     * Might as well asset everything else for the heck of it
     */

     const order = this.current_execution_order;

     expect(order.price, 'Expected execution order price to be a null').to.be.null;
     expect(order.fee, 'Expected execution order fee to be a null').to.be.null;
     expect(order.placed_timestamp, 'Expected execution order placed timestamp to be a null').to.be.null;
     expect(order.completed_timestamp, 'Expected execution order completed timestamp to be a null').to.be.null;
     expect(order.external_identifier, 'Expected execution order external identifier to be a null').to.be.null;
     expect(order.instrument_id).to.equal(this.current_recipe_order.instrument_id, 'Expected execution order instrument to match the recipe orders instrument');
     expect(order.type).to.equal(EXECUTION_ORDER_TYPES.Market, 'Expected the execution order to be a Market Order');
     expect(order.side).to.equal(this.current_recipe_order.side, 'Expected the side of execution order to equal the side of the recipe order');
     expect(order.exchange_id).to.equal(this.current_recipe_order.target_exchange_id, 'Expected the execution order to have the same exchange identifier as the recipe order');

});

Then('no new Execution Order is saved to the database', async function() {

    const { ExecutionOrder } = require('../../../models');

    const execution_order_count = await ExecutionOrder.count({
        where: { recipe_order_id: this.current_recipe_order.id }
    });

    expect(execution_order_count).to.equal(1, 'Expected the amount of execution orders to be 1 as it was previously');

});
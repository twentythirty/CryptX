const {
    Given,
    When,
    Then
} = require('cucumber');
const chai = require('chai');
const {
    expect
} = chai;

const {
    nullOrNumber,
    greaterThanOrEqual,
    lessThanOrEqual
} = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no Execution Orders in the system', function () {

    const {
        ExecutionOrder
    } = require('../../../models');

    return ExecutionOrder.destroy({
        where: {}
    });

});

async function generateExecutionOrders(amount, order_status, for_exchange, order_id) {

    chai.assert.isNumber(amount, `Specified execution orders amount ${amount} is not a number!`);
    chai.assert.includeMembers(Object.values(EXECUTION_ORDER_STATUSES), [order_status], `Specified execution orders status ${order_status} needs to be a constant from execution orders statuses set!`);
    chai.assert.isObject(for_exchange, `Provided exchange needs to be an exchange entity object!`);

    const {
        ExecutionOrder,
        Instrument,
        InstrumentExchangeMapping,
        ActionLog
    } = require('../../../models');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    let where = {
        exchange_id: for_exchange.id,
        status: order_status
    };
    if(order_id) where.recipe_order_id = order_id;

    const exisitng_orders = await ExecutionOrder.findAll({ where });

    if (exisitng_orders.length >= amount) {
        return exisitng_orders;
    }

    const connector = await ccxtUtil.getConnector(for_exchange.api_id);

    const markets = _.uniq(Object.keys(connector.markets));

    const instruments = await Instrument.findAll({
        where: {
            symbol: markets.splice(_.random(0, amount - 1, false), markets.length - amount - 1)
        },
        raw: true,
        limit: amount,
        include: {
            model: InstrumentExchangeMapping,
            required: true,
            where: {
                exchange_id: for_exchange.id
            }
        }
    });

    let new_execution_orders = [];
    
    for (let i = 0; i < amount; i++) {

        const instrument = instruments[i];

        const limits = _.get(connector, `markets.${instrument.symbol}.limits.amount`);

        new_execution_orders.push({
            exchange_id: for_exchange.id,
            instrument_id: instrument.id,
            recipe_order_id: order_id,
            side: ORDER_SIDES.Buy,
            status: order_status,
            type: EXECUTION_ORDER_TYPES.Market,
            total_quantity: _.random(limits.min, limits.max, true),
            failed_attempts: 0
        });

    }

    new_execution_orders = await ExecutionOrder.bulkCreate(new_execution_orders, {
        returning: true
    });

    return new_execution_orders;
}

Given(/^there (are|is) (.*) (.*) (Execution Orders|Execution Order) for (.*)$/, async function (plural_1, amount, status, plural_2, exchange_name) {

    amount = parseInt(amount);
    const Exchange = require('../../../models').Exchange;
    const exchange = await Exchange.findOne({
        where: {
            name: exchange_name
        }
    });
    chai.assert.isDefined(EXECUTION_ORDER_STATUSES[status], `No key ${status} present for execution order status constants!`);

    let order_id;
    if(this.current_recipe_orders) order_id = this.current_recipe_orders[_.random(0, this.current_recipe_orders.length - 1, false)].id;
    else if(this.current_recipe_order) order_id = this.current_recipe_order.id

    this.current_execution_orders = await generateExecutionOrders(amount, EXECUTION_ORDER_STATUSES[status], exchange, order_id);

    if(amount === 1 && this.current_execution_orders) this.current_execution_order = this.current_execution_orders[0];

    return;
});

Given('the system has execution orders with status Pending', async function () {

    const [MIN_ORDERS, MAX_ORDERS] = [2, 5];
    const sequelize = require('../../../models').sequelize;
    const exchanges = await sequelize.query(`
    SELECT * 
    FROM exchange 
    WHERE exchange.id in (select exchange_id from instrument_exchange_mapping)
    LIMIT 1`, {
        type: sequelize.Sequelize.QueryTypes.SELECT,
        model: require('../../../models').Exchange
    });
    chai.assert.isAtLeast(exchanges.length, 1, `Could not fetch even 1 exchange with mappings!`);

    this.current_execution_orders = await generateExecutionOrders(
        _.random(MIN_ORDERS, MAX_ORDERS + 1, false),
        EXECUTION_ORDER_STATUSES.Pending,
        exchanges[0]
    );
    this.check_log_id = _.map(this.current_execution_orders, 'id');
    //create extra job config for following step
    this.job_config = {
        execution_orders: this.current_execution_orders,
        fail_ids: []
    }
});

Given('the Pending Execution Orders are placed on the exchanges', async function () {

    const {
        ExecutionOrder,
        Exchange,
        Instrument
    } = require('../../../models');
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

Given(/^the execution orders failed attempts count is (.*) system failure cap$/, async function(failure_proximity) {

    chai.assert.isArray(this.current_execution_orders, 'Context should have already had execution orders in it!');

    const threshold = SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE;
    chai.assert.isNumber(threshold, 'System order placement fail tolerance threshold undefined!');

    let allowed_range = [];

    if (failure_proximity == 'a lot less than') {
        //up to 25% failure allowed
        allowed_range = [0, parseInt(threshold * 0.25)];
        
    } else if (failure_proximity == 'just below') {
        //only one choice
        allowed_range = [threshold - 1, threshold - 1];
    }

    this.current_execution_orders = await Promise.all(_.map(this.current_execution_orders, eo => {

        eo.failed_attempts = _.random(allowed_range[0], allowed_range[1] + 1, false) || 0;
        return eo.save()
    }));
    //save current failed attempts
    this.current_fails = _.fromPairs(_.map(this.current_execution_orders, eo => [eo.id, eo.failed_attempts]));
    //prepare to flunk all orders
    this.job_config.fail_ids = _.map(this.current_execution_orders, 'id');
});

Given('the Execution Orders expire on the exchange before getting filled', function() {

    this.trading_simulation_options = {
        rate: 20,
        multiple_trade_chance: 75,
        force_to_close: true,
        chance_of_new_trade: 50
    };

});

Given('the Exchange is unable to find the Execution Orders', async function() {

    const { Exchange } = require('../../../models');
    const CCXTUtils = require('../../../utils/CCXTUtils');
    
    const exchanges = await Exchange.findAll({ raw: true });

    return Promise.all(exchanges.map(async exchange => {

        const connector = await CCXTUtils.getConnector(exchange.api_id);

        return connector.purgeOrders();

    }));

});

Given('the Exchange does not support Trade fetching', async function() {

    const { Exchange } = require('../../../models');
    const CCXTUtils = require('../../../utils/CCXTUtils');
    
    const exchanges = await Exchange.findAll({ raw: true });

    for(let exchange of exchanges) {

        const connector = await CCXTUtils.getConnector(exchange.api_id);

        connector.has['fetchTrades'] = false;

    }

});

Given('the Pending Execution Orders Failed to be placed on the Exchanges', async function(){

    const models = require('../../../models');
    const { ExecutionOrder } = models;
    const job = require('../../../jobs/cucumber-exchange-order-placer');
    const config = { models };

    //make broken execution orders
    await ExecutionOrder.update({ total_quantity: -1 }, {
        where: { status: EXECUTION_ORDER_STATUSES.Pending }
    });

    config.execution_orders = await ExecutionOrder.findAll({
        where: { status: EXECUTION_ORDER_STATUSES.Pending }
    });

    let tolerance = 0;
    while(tolerance < 50) {
        tolerance++;

        await job.JOB_BODY(config, console.log);

        const remaining_orders = await ExecutionOrder.count({
            where: { status: EXECUTION_ORDER_STATUSES.Pending }
        });

        if(remaining_orders === 0) break;

    }

    expect(tolerance).to.be.lessThan(50, 'Execution Orders failed to fail after 50 cycles');

});

Given(/^the Execution Order is (buying|selling) (\d*|\d+(?:\.\d+)?) (\w*) (using|for) (\w*)$/, async function(side, amount, first_asset, pointer, second_asset) {

    side = _.capitalize(side.replace('ing', ''));

    const { ExecutionOrder, Instrument } = require('../../../models');

    let symbol = `${first_asset}/${second_asset}`;
    if(side === 'Sell') symbol = `${second_asset}/${first_asset}`;

    const instrument = await Instrument.findOne({
        where: { symbol }
    });

    expect(instrument, `Expected to find instrument ${symbol}`).to.be.not.null

    return ExecutionOrder.update({
        side: ORDER_SIDES[side],
        instrument_id: instrument.id,
        total_quantity: amount
    },{
        where: { id: this.current_execution_order.id }
    });
    
});

Given(/^the Execution Order was priced at (\d*|\d+(?:\.\d+)?) (\w*) and feed at (\d*|\d+(?:\.\d+)?) (\w*) on the Exchange$/, function(price, optional_symbol_1, fee, optional_symbol_2) {

    const { ExecutionOrder } = require('../../../models');

    return ExecutionOrder.update({ price, fee }, {
        where: { id: this.current_execution_order.id }
    });

});

Given(/^the Execution Order was (half|fully) filled by (\d*) Fills on (.*)$/, async function(amount, count, date_string) {

    count = parseInt(count);
    const proportion = amount === 'half' ? 0.5 : 1;

    const { ExecutionOrder, ExecutionOrderFill, Instrument, Asset, sequelize } = require('../../../models');
    const { logAction } = require('../../../utils/ActionLogUtil');

    const instrument = await Instrument.findById(this.current_execution_order.instrument_id, {
        include: [{
            model: Asset,
            as: 'transaction_asset'
        },{
            model: Asset,
            as: 'quote_asset'
        }]
    });
    expect(instrument, `Expected to find instrument with id "${this.current_execution_order.instrument_id}"`).to.be.not.null;
    
    const fee_asset = this.current_execution_order.side === ORDER_SIDES.Buy ? instrument.quote_asset : instrument.transaction_asset;

    //update execution order
    this.current_execution_order = await ExecutionOrder.findById(this.current_execution_order.id);

    let fills = [];
    for(let i = 0; i < count; i++) {

        fills.push({
            execution_order_id: this.current_execution_order.id,
            fee: this.current_execution_order.fee / count,
            fee_asset_id: fee_asset.id,
            fee_asset_symbol: fee_asset.symbol,
            price: this.current_execution_order.price,
            quantity: (this.current_execution_order.total_quantity / count) * proportion,
            timestamp: Date.parse(date_string)
        });

        await logAction('execution_orders.generate_fill', {
            args: { amount: (this.current_execution_order.total_quantity / count) * proportion },
            relations: { execution_order_id: this.current_execution_order.id },
            timestamp: Date.parse(date_string)
        });

    }

    fills = await sequelize.transaction(async transaction => {

        await ExecutionOrderFill.destroy({
            where: { execution_order_id: this.current_execution_order.id }
        }, { transaction });

        return ExecutionOrderFill.bulkCreate(fills, { transaction, returning: true });

    });

    this.current_execution_order_fills = fills;
    
});

When('the system does the task "fetch execution order information" until the Execution Orders are no longer in progress', async function () {

    const models = require('../../../models');
    const job = require('../../../jobs/exec-order-fill-fetcher');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    const { ExecutionOrder } = models;

    const config = { models };

    let execution_orders = this.current_execution_orders;

    if (!execution_orders) execution_orders = await ExecutionOrder.findAll({
        where: {
            status: EXECUTION_ORDER_STATUSES.InProgress
        }
    });

    const connectors = await Promise.all(_.uniq(_.map(execution_orders, 'exchange_id')).map(exchange_id => {
        return ccxtUtil.getConnector(exchange_id);
    }));

    let tolerance = 0;

    while (tolerance < 50) {
        tolerance++;

        let simulation_options = this.trading_simulation_options;

        if(!simulation_options) simulation_options = {
            rate: 5,
            multiple_trade_chance: 75
        };

        for (let connector of connectors) connector.simulateTrades(simulation_options);

        await job.JOB_BODY(config, console.log);

        const unfinished_order_count = await ExecutionOrder.count({
            where: {
                status: EXECUTION_ORDER_STATUSES.InProgress
            }
        });

        if (unfinished_order_count === 0) break;

    }

    expect(tolerance).to.be.lessThan(50, 'Execution orders failed to fill up after 50 job cucles');

    for(let connector of connectors) connector.has['fetchTrades'] = true;

});

When(/^I select a (.*) Execution Order$/, async function(status) {

    const { ExecutionOrder } = require('../../../models');

    const order = await ExecutionOrder.findOne({
        where: { status: EXECUTION_ORDER_STATUSES[status] }
    });

    expect(order, `Expected to find an Execution Order with status ${status}`).to.not.be.null;

    this.current_execution_order = order;

});

When('I see logs related to the the failure from the Execution Order details', async function() {

    return chai
        .request(this.app)
        .get(`/v1/execution_orders/${this.current_execution_order.id}`)
        .set('Authorization', World.current_user.token)
        .then(result => {

            expect(result).to.have.status(200);
            expect(result.body.execution_order).to.be.an('object', 'Expected to have a execution order object inside the body response');

            this.current_response = result;

            const logs = result.body.action_logs;

            expect(logs.length).to.be.greaterThan(0, 'Expected the logs to be not an empty array');

            const error_logs = logs.filter(l => l.translationKey === 'logs.execution_orders.error');
            
            const failure_logs = logs.filter(l => l.translationKey === 'logs.execution_orders.failed_attempts');

            expect(error_logs.length).to.equal(SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE, 'Expected the amount of error logs to be same as the max allowed number');
            expect(failure_logs.length).to.equal(1, 'Expected only to have log stating that the order failed');

        });

});

When('I retry the Execution Order', async function() {

    return chai
        .request(this.app)
        .post(`/v1/execution_orders/${this.current_execution_order.id}/change_status`)
        .set('Authorization', World.current_user.token)
        .send({ status: EXECUTION_ORDER_STATUSES.Pending })
        .then(result => {

            expect(result).to.have.status(200);
            expect(result.body.status).to.equal(`execution_orders.status.${EXECUTION_ORDER_STATUSES.Pending}`, 'Expected to received a translated Pending status');
            
            this.current_response = result;

        });

});

When('I fetch the Execution Order details', async function() {

    const [ execution_order, fills ] = await Promise.all([
        chai
        .request(this.app)
        .get(`/v1/execution_orders/${this.current_execution_order.id}`)
        .set('Authorization', World.current_user.token),
        chai
        .request(this.app)
        .post(`/v1/exec_orders_fills/of_execution_order/${this.current_execution_order.id}`)
        .set('Authorization', World.current_user.token)
    ]);

    this.current_execution_order_details = execution_order.body.execution_order;
    this.current_execution_order_logs = execution_order.body.action_logs;
    this.current_execution_order_fills_list = fills.body.execution_order_fills;
    this.current_execution_order_fills_footer = fills.body.footer;
    
});

Then('an Execution Order Fill is created for each Trade fetched from the exchange', async function () {

    const {
        ExecutionOrder,
        Instrument,
        ExecutionOrderFill,
        Asset
    } = require('../../../models');

    const CCXTUtils = require('../../../utils/CCXTUtils');

    const [execution_orders, fills] = await Promise.all([
        ExecutionOrder.findAll({
            where: {
                id: this.current_execution_orders.map(ex => ex.id)
            },
            include: Instrument,
            raw: true
        }),
        ExecutionOrderFill.findAll({
            where: {
                execution_order_id: this.current_execution_orders.map(ex => ex.id)
            },
            raw: true
        })
    ]);

    for (let order of execution_orders) {

        const order_fills = fills.filter(fill => fill.execution_order_id === order.id);

        const connector = await CCXTUtils.getConnector(order.exchange_id);

        let trades = await connector.fetchMyTrades(order['Instrument.symbol'], Date.now() - 1000000);
        trades = trades.filter(trade => trade.order === order.external_identifier);

        expect(order_fills.length).to.equal(trades.length, 'Expected the number of order fill entries to equal to the number of trades on the exchange');

    }

    const assets = await Asset.findAll({
        where: {
            id: fills.map(fill => fill.fee_asset_id)
        },
        raw: true
    });

    expect(assets.length).to.be.greaterThan(0, 'Expected to find matching fee assets for fills');

    for (let fill of fills) {

        const asset = assets.find(a => a.id === fill.fee_asset_id);

        expect(fill.fee_asset_symbol).to.equal(asset.symbol, 'Expected to have matching fee asset symbols for fills');

    }

    this.current_execution_orders = execution_orders;
    this.current_execution_order_fills = fills;

});

Then('the Execution Order fee and total quantity will equal the sums of fees and quantities of Execution Order Fills', function() {

    for(let order of this.current_execution_orders) {

        const order_fills = this.current_execution_order_fills.filter(fill => fill.execution_order_id === order.id);

        const expected_values = order_fills.reduce((acc, fill) => {
            return acc = Object.assign(acc, {
                fee: acc.fee.plus(fill.fee),
                total_quantity: acc.total_quantity.plus(fill.quantity)
            });
        }, { fee: Decimal(0), total_quantity: Decimal(0) });

        expect(Decimal(order.fee).toPrecision(10)).to.equal(expected_values.fee.toPrecision(10), 'Expected the Execution Order fee to equal to sum of Fill fees');
        expect(Decimal(order.total_quantity).toPrecision(10)).to.equal(expected_values.total_quantity.toPrecision(10), 'Expected the Execution Order total quantity to equal to sum of Fill quantities');

    };

});

Then('the Execution Order price will equal to the weighted average of Fill prices', function() {

    for(let order of this.current_execution_orders) {

        const order_fills = this.current_execution_order_fills.filter(fill => fill.execution_order_id === order.id);

        let expected_price = order_fills.reduce((acc, fill) => {
            return acc = Object.assign(acc, {
                price_sum: acc.price_sum.plus(Decimal(fill.price).mul(fill.quantity)),
                quantity: acc.quantity.plus(fill.quantity)
            });
        }, { price_sum: Decimal(0), quantity: Decimal(0) });

        expected_price = expected_price.price_sum.div(expected_price.quantity);

        expect(Decimal(order.price).toPrecision(10)).to.equal(expected_price.toPrecision(10), 'Expectedt he Execution Order price to equal to the weighted average prices of Fills');
        
    };

});

Then('an Action Log is created for each new Execution Order Fill', async function() {

    const { ActionLog } = require('../../../models');

    let logs = await ActionLog.findAll({
        where: {
            execution_order_id: this.current_execution_orders.map(ex => ex.id),
            translation_key: 'logs.execution_orders.generate_fill'
        },
        raw: true
    });

    //Using lessthan or equal, since logs may not have been created at the time of step. Not much we can do.
    expect(logs.length).to.equal(this.current_execution_order_fills.length, 'Expected the amount of logs related to Fill creation to equal the actual amount of Fills');

    logs = logs.map(log => {
        log.translation_args = JSON.parse(log.translation_args);
        return log;
    });

    //Since logs don't store actual fill ids, lets just check that the amounts match
    const log_quantity_sum = logs.reduce((acc, log) => {
        return acc = acc.plus(log.translation_args.amount);
    }, Decimal(0));


    const expected_amount = this.current_execution_order_fills.reduce((acc, fill) => {
        return acc = acc.plus(fill.quantity);
    }, Decimal(0));

    expect(log_quantity_sum.toPrecision(10)).to.equal(expected_amount.toPrecision(10), 'Expected the logged fill amount to equal the actuall fills amount');

});

Then('an Action Log is created for each FullyFilled Order', async function() {

    const { ActionLog } = require('../../../models');

    let logs = await ActionLog.findAll({
        where: {
            execution_order_id: this.current_execution_orders.map(ex => ex.id),
            translation_key: 'logs.execution_orders.fully_filled'
        },
        raw: true
    });

    expect(logs.length).to.equal(this.current_execution_orders.length, 'Expected the amount of logs of fully filled order to equal the amount of FullyFilled Execution Orders');

});

Then(/^the Execution Orders status will be (.*)$/, async function (status) {

    const {
        ExecutionOrder
    } = require('../../../models');

    const execution_orders = await ExecutionOrder.findAll({
        where: { id: this.current_execution_orders.map(ex => ex.id) }
    });

    let statuses = status.split(/or\b|,|and\b/g).map(s => EXECUTION_ORDER_STATUSES[s.trim()]);

    expect(execution_orders.length).to.be.greaterThan(0, 'Failed to find previously placed execution orders');

    for (let order of execution_orders) expect(statuses).includes(order.status, `Expected the Execution orders status to be ${status}`);

    this.current_execution_orders = execution_orders;

});

Then(/^all the execution orders will have status (.*)/, function (status_word) { 

    chai.assert.isArray(this.current_execution_orders, 'Context does not contain current execution orders!');
    chai.assert.isNumber(EXECUTION_ORDER_STATUSES[status_word], `No execution order status constant found for status ${status_word}!`);

    _.forEach(this.execution_orders, execution_order => {
        chai.assert.equal(execution_order.status, EXECUTION_ORDER_STATUSES[status_word], `Execution order ${execution_order.id} had wrong status!`);
    });
});

Then(/^all the execution orders (.*) have external identifiers/, function(presence) {

    chai.assert.isArray(this.current_execution_orders, 'Context does not contain current execution orders!');

    _.forEach(this.execution_orders, execution_order => {

        const asserter = presence == 'will'? chai.assert.isNotNull : chai.assert.isNull;
        asserter(execution_order.external_identifier `Idea was execution order ${execution_order.id} ${presence} gain external identifier!`);
    });
});

Then(/^all the execution orders failed attempts is incremented by (.*)$/, async function(amount) {

    const amount_num = parseInt(amount);
    chai.assert.isObject(this.current_fails, 'Context does not contain prev execution orders failures count!');
    const execution_orders_fresh = await require('../../../models').ExecutionOrder.findAll({
        where: {
            id: _.map(this.current_execution_orders, 'id')
        }
    });
    const fresh_orders_by_id = _.keyBy(execution_orders_fresh, 'id');

    _.forEach(this.current_fails, (fails, eo_id) => {
        chai.assert.isNotNull(fresh_orders_by_id[eo_id], `No fresh excution order fethced for id ${eo_id}`);
        chai.assert.equal(
            fails + amount_num, 
            fresh_orders_by_id[eo_id].failed_attempts, 
            'New amount of failed attempts didnt match up with old!');
    });
    
});

Then('a new Execution Order is saved to the database', async function () {

    const {
        ExecutionOrder,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    const execution_order = await ExecutionOrder.findOne({
        where: {
            recipe_order_id: this.current_recipe_order.id,
            status: {
                [Op.ne]: EXECUTION_ORDER_STATUSES.FullyFilled
            }
        }
    });

    this.current_execution_order = execution_order;

});

Then('the total quantity will be within exchange limits', async function () {

    const {
        Instrument,
        InstrumentExchangeMapping
    } = require('../../../models');
    const CCXTUtils = require('../../../utils/CCXTUtils');
    const ccxtUnified = require('../../../utils/ccxtUnified');

    const connector = await CCXTUtils.getConnector(this.current_execution_order.exchange_id);
    let unifiedExchange = await ccxtUnified.getExchange(this.current_execution_order.exchange_id);
    await unifiedExchange.isReady();
    
    const instrument = await Instrument.findById(this.current_execution_order.instrument_id, {
        include: {
            model: InstrumentExchangeMapping,
            where: {
                exchange_id: this.current_execution_order.exchange_id
            },
            limit: 1
        }
    });

    let limits = await unifiedExchange.getSymbolLimits(instrument.InstrumentExchangeMappings[0].external_instrument_id);

    const calculated_quantity = parseFloat(this.current_execution_order.spend_amount);

    expect(calculated_quantity).to.satisfy(greaterThanOrEqual(limits.spend.min), 'Expected the calculated total quantity of the execution order to be greater than the min amount limit of exchange');
    expect(calculated_quantity).to.satisfy(lessThanOrEqual(limits.spend.max), 'Expected the calculated total quantity of the execution order to be less than the max amount limit of exchange');

});

Then(/^the Execution Order (.*) will (not be set|be the same as the Order|be Market)$/, function (fields, assertion) {

    const order = this.current_execution_order;

    const field_names = fields.split(/,|and/).map(f => _.snakeCase(f.trim()));

    for(let field of field_names) {

        let field_to_check = order[field];
        if(_.isUndefined(field_to_check)) field_to_check = order[`${field}_id`];
        expect(field_to_check, `Expected to find the field "${field}" in Order object`).to.be.not.undefined;

        switch(assertion) {

            case 'not be set':
                expect(field_to_check, `Expected Order ${field} to be not set`).to.be.null;
                break;

            case 'be the same as the Order':
                const expected = this.current_recipe_order[field] || this.current_recipe_order[`${field}_id`] ||this.current_recipe_order[`target_${field}_id`];
                expect(field_to_check).to.equal(expected, `Expected fields "${field}" to match`);
                break;

            case 'be Market':
                expect(field_to_check).to.equal(EXECUTION_ORDER_TYPES.Market, `Expected order to be a Market type`);
                break;

        }
        
    }

});

Then('no new Execution Order is saved to the database', async function () {

    const {
        ExecutionOrder
    } = require('../../../models');

    const execution_order_count = await ExecutionOrder.count({
        where: {
            recipe_order_id: this.current_recipe_order.id
        }
    });

    expect(execution_order_count).to.equal(1, 'Expected the amount of execution orders to be 1 as it was previously');

});

Then(/^Execution Orders with status (.*) will have (.*)$/, async function(status, condition) {

    const { ExecutionOrderFill } = require('../../../models');

    const execution_orders = this.current_execution_orders.filter(ex => ex.status === EXECUTION_ORDER_STATUSES[status]);

    const fills = await ExecutionOrderFill.findAll({
        where: {
            execution_order_id: execution_orders.map(ex => ex.id)
        },
        raw: true
    });

    for(let order of execution_orders) {

        const order_fills = fills.filter(fill => fill.execution_order_id === order.id);

        switch(condition) {

            case 'at least 1 Fill':
                expect(order_fills.length).to.be.greaterThan(0, 'Expected to have at least 1 fill for a PartiallyFilled Execution Order');
                break;

            case '0 Fills':
            default:
                expect(order_fills.length).to.equal(0, 'Expected no Fills for a NotFilled Execution Order');
                break;

        }

    }

});

Then('the Execution Orders failed attempts will equal to the threshold specified in the system settings', function() {

    for(let order of this.current_execution_orders) {

        expect(order.failed_attempts).to.satisfy(greaterThanOrEqual(SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE));

    }

});

Then('the Execution Orders errors are logged', async function() {

    const { ActionLog } = require('../../../models');

    const logs = await ActionLog.count({
        where: {
            execution_order_id: this.current_execution_orders.map(ex => ex.id),
            translation_key: 'logs.execution_orders.error'
        }
    });

    const expected_log_amount = this.current_execution_orders.length * SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE;

    expect(logs).to.equal(expected_log_amount, 'Expected the error log amount to equal the amount of execution orders time the max tolerance');

});

Then('the Execution Order price and fee will be taken from the Order received from the Exchange', async function() {

    const CCXTUtils = require('../../../utils/CCXTUtils');

    for(let order of this.current_execution_orders) {

        const connector = await CCXTUtils.getConnector(order.exchange_id);

        const external_order = await connector.fetchOrder(order.external_identifier, null, { ignore_symbol: true });

        expect(Decimal(order.price).toPrecision(10)).to.equal(Decimal(external_order.price).toPrecision(10), 'Expected Execution Order price to match with External Order price');
        expect(Decimal(order.fee).toPrecision(10)).to.equal(Decimal(external_order.fee.cost).toPrecision(10), 'Expected Execution Order fee to match with External Order fee');

    };

});

Then('sums of fees and quantity of Fills will equal to Execution Order ones', async function() {

    const { ExecutionOrderFill } = require('../../../models');

    const fills = await ExecutionOrderFill.findAll({
        where: { execution_order_id: this.current_execution_orders.map(ex => ex.id) },
        raw: true
    });

    for(let order of this.current_execution_orders) {

        const order_fills = fills.filter(fill => fill.execution_order_id === order.id);

        expect(order_fills.length).to.be.greaterThan(0, 'Expected the Execution Order to have at least one Fill entry');

        const expected_values = order_fills.reduce((acc, fill) => {
            return acc = Object.assign(acc, {
                fee: acc.fee.plus(fill.fee),
                quantity: acc.quantity.plus(fill.quantity)
            });
        }, { price: Decimal(0), fee: Decimal(0), quantity: Decimal(0) });

        expect(Decimal(order.fee).toPrecision(10)).to.equal(expected_values.fee.toPrecision(10), 'Expected the Execution Order fee to equal to the sum in Fills');
        expect(Decimal(order.total_quantity).toPrecision(10)).to.equal(expected_values.quantity.toPrecision(10), 'Expected the Execution Order total quantity to equal to the sum in Fills');

    }

    this.current_execution_order_fills = fills;
    
});

Then('the price of Fills will equal to the price of the Execution Order', async function() {

    for(let order of this.current_execution_orders) {

        const order_fills = this.current_execution_order_fills.filter(fill => fill.execution_order_id === order.id);

        for(let fill of order_fills) {

            expect(Decimal(fill.price).toPrecision(10)).to.equal(Decimal(order.price).toPrecision(10), 'Expected the Fill price to equal to the price of the Execution Order');

        }

    }
    
});

Then(/^the Execution Order status will be (.*)$/, async function(status) {

    const { ExecutionOrder } = require('../../../models');

    const order = await ExecutionOrder.findById(this.current_execution_order.id);

    expect(order, 'Expected to find the current Execution Order').to.be.not.null;

    expect(order.status).to.equal(EXECUTION_ORDER_STATUSES[status], `Expected the Execution Order to have status ${status}`);

    this.current_execution_order = order;

});

Then('the number of failed attempts on the Executon Order will reset back to 0', function() {

    expect(this.current_execution_order.failed_attempts).to.equal(0, 'Expected the failed attempts of the Execution Order to be back to 0');

});

Then('the system won\'t allow me to retry Execution Orders with status other than Failed', async function() {

    const { ExecutionOrder, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const not_failed_order = await ExecutionOrder.findOne({
        where: {
            status: { [Op.ne]: EXECUTION_ORDER_STATUSES.Failed }
        }
    });

    expect(not_failed_order, 'Expected to find a non Failed Execution Order').to.be.not.null;

    return chai
        .request(this.app)
        .post(`/v1/execution_orders/${this.current_execution_order.id}/change_status`)
        .set('Authorization', World.current_user.token)
        .send({ status: EXECUTION_ORDER_STATUSES.Pending })
        .catch(result => {

            expect(result).to.have.status(422);
            
            const error = result.response.body.error;

            expect(error).to.equal('Only Execution orders with the status Failed can be reinitiated',
                'Expected the error to contain information about not being allowed to reinitiate an Execution Order whose status is not Failed'
            );

            this.current_response = result;

        });

});
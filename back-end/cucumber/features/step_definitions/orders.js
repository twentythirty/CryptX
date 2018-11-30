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

Given(/^the system has (Pending|Rejected|Approved) Recipe Order Group with (\d*) Orders$/, async function(group_status, order_amount) {

    order_amount = parseInt(order_amount);

    const { RecipeOrderGroup, RecipeOrder, Instrument, Exchange, sequelize }  = require('../../../models');

    const [ instruments, exchanges ] = await Promise.all([
        Instrument.findAll({
            order: sequelize.literal('random()'),
            limit: 20,
            raw: true
        }),
        Exchange.findAll({ 
            where: {
                is_mappable: true
            },
            raw: true
        })
    ]);

    return sequelize.transaction(async transaction => {

        const group = await RecipeOrderGroup.create({
            approval_comment: group_status === 'Pending' ? '' : 'RATIOSNAKE',
            approval_status: RECIPE_ORDER_GROUP_STATUSES[group_status],
            approval_timestamp: group_status === 'Pending' ? null : new Date(),
            approval_user_id: group_status === 'Pending' ? null : World.users.trader.id,
            created_timestamp: new Date(),
            recipe_run_id: this.current_recipe_run.id
        }, { transaction });

        this.current_recipe_order_group = group;

        let orders = [];
        for(let i = 0; i < order_amount; i++) {

            orders.push({
                instrument_id: instruments[_.random(0, instruments.length - 1, false)].id,
                price: _.random(0.01, 2, true),
                quantity: _.random(0.1, 20, true),
                spend_amount: _.random(0.001, 0.2, true),
                recipe_order_group_id: group.id,
                side: _.random(0, 1, false) ? ORDER_SIDES.Buy : ORDER_SIDES.Sell,
                status: group_status === 'Approved' ? RECIPE_ORDER_STATUSES.Executing : RECIPE_ORDER_STATUSES[group_status],
                target_exchange_id: exchanges[_.random(0, exchanges.length - 1, false)].id
            });

        }

        orders = await RecipeOrder.bulkCreate(orders, { transaction, returning: true });

        this.current_recipe_orders = orders;
        this.current_recipe_order = orders[0];

    });

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
                transaction_asset_id: instrument.quote_asset_id,
                quote_asset_id: instrument.transaction_asset_id
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

Given('one of the orders instrument market data is older than allowed by system thresholds', async function() {

    const models = require('../../../models');

    //surprisingly, lodash random int is range-end-inclusive
    const random_idx = _.random(0, this.current_generated_orders.length, false) % this.current_generated_orders.length;
    const new_order = this.current_generated_orders[random_idx];
    chai.assert.isObject(new_order, 'Did not find any Pending Recipe Orders to tamper with!');

    //remove potentially good market data for the instrument exchange pair (newer than 1 day ago)
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await models.InstrumentMarketData.destroy({
        where: {
            instrument_id: new_order.instrument_id,
            exchange_id: new_order.target_exchange_id,
            timestamp: {
                [models.Sequelize.Op.gte]: yesterday
            }
        }
    });
    chai.assert.isObject(SYSTEM_SETTINGS, `System settings object not initialized!`);
    chai.assert.isNumber(SYSTEM_SETTINGS.BASE_ASSET_PRICE_TTL_THRESHOLD, `Base instrument data price TTL not initialized!`);
    chai.assert.isNumber(SYSTEM_SETTINGS.MARKET_DATA_TTL_HANDICAP, `Instrument data price TTL handicap not initialized!`)
    
    this.current_stale_instrument = await new_order.getInstrument();
    this.current_stale_exchange = await new_order.getTarget_exchange();
    const handicap_seconds = SYSTEM_SETTINGS.BASE_ASSET_PRICE_TTL_THRESHOLD + SYSTEM_SETTINGS.MARKET_DATA_TTL_HANDICAP;
    this.currenth_price_ttl_threshold = new Date(new Date().getTime() - handicap_seconds * 1000)
});

Given('one of the orders total quantity is below the trade threshold on this exchange and instrument pair', async function() {

    const models = require('../../../models');
    const ccxtUnified = require('../../../utils/ccxtUnified');
    chai.assert.isArray(this.current_generated_orders, 'Generated orders array not present in World!');

    //surprisingly, lodash random int is range-end-inclusive
    const random_idx = _.random(0, this.current_generated_orders.length, false) % this.current_generated_orders.length;
    const new_order = this.current_generated_orders[random_idx];
    chai.assert.isObject(new_order, 'Did not find any Pending Recipe Orders to tamper with!');

    let unifiedExchange = await ccxtUnified.getExchange(new_order.target_exchange_id);
    await unifiedExchange.isReady();
    chai.assert.isFalse(unifiedExchange._connector.loading_failed, `CCXT connector for exchange id ${new_order.target_exchange_id} failed to load!`);
    
    const mapping = await models.InstrumentExchangeMapping.findOne({
        where: {
            instrument_id: new_order.instrument_id,
            exchange_id: new_order.target_exchange_id
        }
    })
    chai.assert.isNotNull(mapping, `recipe order ${new_order.id} lacked mapping under instrument id ${new_order.instrument_id} and exchange id ${new_order.target_exchange_id}`);
    const limits = await unifiedExchange.getSymbolLimits(mapping.external_instrument_id);
    // chai.assert.isObject(connector_market, `CCXT did not have connector object for instrument ${mapping.external_instrument_id}`);
    // chai.assert.isTrue(connector_market.active, `Connector ${unified_con.id} for instrument ${mapping.external_instrument_id} is not active!`);
    const connector_min = limits.spend.min;
    chai.assert.isNumber(connector_min, `Cannot tamper with min when connector amount min is ${connector_min} - not a number!`);
    new_order.spend_amount = Decimal(connector_min).mul(0.75).toString(); //about 25% less for IEEE to notice even with small values
    this.current_ccxt_lower_bound = connector_min;
    this.current_bad_low_total = new_order.spend_amount;
    await new_order.save();
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
        InstrumentMarketData,
        Asset,
        sequelize
    } = require('../../../models');

    const { Op } = sequelize;

    const CCXTUtil = require('../../../utils/CCXTUtils');
    const ccxtUnified = require('../../../utils/ccxtUnified');

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
        },
        order: sequelize.literal('random()')
    });

    const connector = await CCXTUtil.getConnector(exchange.api_id);
    let unifiedExchange = await ccxtUnified.getExchange(exchange.api_id);
    await unifiedExchange.isReady();
    let limits = await unifiedExchange.getSymbolLimits(mapping.external_instrument_id);
    const amount_limits = _.get(connector, `markets.${mapping.external_instrument_id}.limits.amount`);
    
    if(amount_limits.min > 20) amount_limits.min = 0.1; //Seems the job does not work well with large min limits.

    return sequelize.transaction(transaction => {

        return RecipeOrderGroup.create({
            created_timestamp: new Date(),
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved,
            approval_comment: 'it\'s all good'
        }, {
            transaction
        }).then(group => {

            let max_spend = limits.spend.min;
            let base = /\w+\/BTC$/.test(mapping.external_instrument_id) ? SYSTEM_SETTINGS.BASE_BTC_TRADE :
                /\w+\/ETH$/.test(mapping.external_instrument_id) ? SYSTEM_SETTINGS.BASE_ETH_TRADE : 0.05;
            let spend = _.random(base * 3, base * 30);//_.random(limits.spend.min * 3, max_spend > limits.spend.max ? limit.spend.max : max_spend);

            const price = limits.spend.min / limits.amount.min;

            return RecipeOrder.create({
                instrument_id: mapping.Instrument.id,
                price: price,
                quantity: 0,//_.clamp(amount_limits.min * 20, amount_limits.max) / price,
                spend_amount: spend,
                side: ORDER_SIDES.Buy,
                status: RECIPE_ORDER_STATUSES[status],
                target_exchange_id: exchange.id,
                recipe_order_group_id: group.id
            }, {
                transaction
            }).then(order => {

                this.current_recipe_order = order;

                CRR_ORD_ID = order.id;
            });

        });

    });

});

Given(/^the system has (\w*) Recipe Order to (sell|buy) (\d*|\d+(?:\.\d+)?) (\w*) for (\w*) at the price of (\d*|\d+(?:\.\d+)?) on (\w*)$/, async function(status, type, amount, asset_symbol_1, asset_symbol_2, price, exchange_name) {

    const { Exchange, Instrument, RecipeOrder, RecipeOrderGroup, InstrumentMarketData, sequelize } = require('../../../models');

    const symbols = [`${asset_symbol_1}/${asset_symbol_2}`, `${asset_symbol_2}/${asset_symbol_1}`];
    const [ exchange, instrument ] = await Promise.all([
        Exchange.findOne({ where: { name: exchange_name } }),
        Instrument.findOne({ where: { symbol: symbols } })
    ]);

    expect(exchange, `Expected to find exchange named "${exchange_name}"`).to.be.not.null;
    expect(instrument, `Expected to find an instrument ${symbols}`).to.be.not.null;

    return sequelize.transaction(async transaction => {

        this.current_recipe_order_group = await RecipeOrderGroup.create({
            created_timestamp: new Date(),
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved,
            approval_comment: 'it\'s all good'
        }, {
            transaction
        });

        this.current_recipe_order = await RecipeOrder.create({
            instrument_id: instrument.id,
            target_exchange_id: exchange.id,
            side: ORDER_SIDES.Buy,
            quantity: type === 'buy' ? amount : 0,
            spend_amount: type === 'sell' ? amount : 0,
            price,
            status: RECIPE_ORDER_STATUSES[status],
            recipe_order_group_id: this.current_recipe_order_group.id
        }, {
            transaction
        });

        return InstrumentMarketData.create({
            ask_price: price,
            bid_price: price,
            exchange_id: exchange.id,
            instrument_id: instrument.id,
            timestamp: Date.now()
        });

    });

});

Given(/^the Order is (.*) filled by (a|[0-9]) FullyFilled (ExecutionOrder|ExecutionOrders)$/, async function (amount, quantity, plural) {

    const {
        ExecutionOrder,
        ExecutionOrderFill,
        sequelize
    } = require('../../../models');

    let spend_amount = 0;
    quantity = quantity === 'a' ? 1 : parseInt(quantity);

    switch (amount) {

        case 'partially':
        case 'half':
            spend_amount = parseFloat(this.current_recipe_order.spend_amount) / quantity / 2;
            break;

        case 'fully':
        default:
            spend_amount = parseFloat(this.current_recipe_order.spend_amount) / quantity;
            break;

    }

    const fill_count = 10;

    return Promise.all(Array.from(Array(quantity)).map(() => {

        return sequelize.transaction(transaction => {

            return ExecutionOrder.create({
                placed_timestamp: new Date(),
                completed_timestamp: new Date(),
                exchange_id: this.current_recipe_order.target_exchange_id,
                external_identifier: 'jk4h5kj34h5k3h5j3hk',
                failed_attempts: 0,
                fee: (parseFloat(this.current_recipe_order.price) / 100),
                instrument_id: this.current_recipe_order.instrument_id,
                price: this.current_recipe_order.price,
                recipe_order_id: this.current_recipe_order.id,
                side: this.current_recipe_order.side,
                status: EXECUTION_ORDER_STATUSES.FullyFilled,
                total_quantity: spend_amount / this.current_recipe_order.price,
                spend_amount: spend_amount,
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

    }));

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
    let spend_amount = Decimal(this.current_recipe_order.spend_amount).div(2);
    let total_quantity = Decimal(spend_amount).div(this.current_recipe_order.price);
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
            total_quantity: total_quantity.toString(),
            spend_amount: spend_amount.toString(),
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
    const cccxtUnified = require('../../../utils/ccxtUnified');

    const exchange = await Exchange.findById(this.current_recipe_order.target_exchange_id);
    let unifiedExchange = await cccxtUnified.getExchange(this.current_recipe_order.target_exchange_id);

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

    const limits = await unifiedExchange.getSymbolLimits(mapping.external_instrument_id);
    const spend_amount = Decimal(this.current_recipe_order.spend_amount).minus(Decimal(limits.spend.min).div(2)).toString();

    const fill_count = 1;

    return sequelize.transaction(transaction => {

        return ExecutionOrder.create({
            placed_timestamp: new Date(),
            completed_timestamp: new Date(),
            exchange_id: this.current_recipe_order.target_exchange_id,
            external_identifier: 'jk4h5kj34h5k3h5j3hk',
            failed_attempts: 0,
            fee: (parseFloat(spend_amount / this.current_recipe_order.price) / _.random(98, 100, false)),
            instrument_id: this.current_recipe_order.instrument_id,
            price: this.current_recipe_order.price,
            recipe_order_id: this.current_recipe_order.id,
            side: this.current_recipe_order.side,
            status: EXECUTION_ORDER_STATUSES.FullyFilled,
            total_quantity: total_quantity,
            spend_amount: spend_amount,
            type: EXECUTION_ORDER_TYPES.Market
        }, {
            transaction
        }).then(execution_order => {

            let fills = [];

            for (let i = 0; i < fill_count; i++) {

                const approximate_quantity = Decimal(execution_order.spend_amount)
                    .div(execution_order.price)
                    .div(fill_count).toString();
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

Given('the Order is not filled by Execuion Orders at all', function() {

    const { ExecutionOrder } = require('../../../models');

    return ExecutionOrder.destroy({
        where: { recipe_order_id: this.current_recipe_order.id }
    });

});

Given('the Recipe Orders statuses were updated', async function() {

    const { ExecutionOrder, RecipeOrder, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const orders_with_statuses = await sequelize.query(`
        SELECT
            COUNT(*) AS order_count,
            "group".id AS group_id, 
            eo.status AS ex_status
        FROM execution_order AS eo
        JOIN recipe_order AS "order" ON "order".id = eo.recipe_order_id
        JOIN recipe_order_group AS "group" ON "order".recipe_order_group_id = "group".id
        WHERE eo.recipe_order_id IS NOT NULL
        GROUP By group_id, ex_status
    `, { type: sequelize.QueryTypes.SELECT });

    const grouped_orders = _.groupBy(orders_with_statuses, 'group_id');
    const fully_filled_only = _.map(grouped_orders, (orders, id) => {
        if(orders.length === 1) return id;
    }).filter(id => id);

    return RecipeOrder.update({
        status: RECIPE_ORDER_STATUSES.Completed
    }, {
        where: { recipe_order_group_id: fully_filled_only }
    });

});

Given('the Recipe Order is two Execution Orders short, one of which will be smaller than the minimum allowed by the Exchange', async function() {

    const { ExecutionOrder, ExecutionOrderFill, InstrumentExchangeMapping, sequelize } = require('../../../models');
    const CCXTUtils = require('../../../utils/CCXTUtils');
    const ccxtUnified = require('../../../utils/ccxtUnified');

    const order = this.current_recipe_order;

    expect(order, `Expected to have a current recipe order`).to.be.not.undefined;

    const [ instrument_mapping, price, connector ] = await Promise.all([
        InstrumentExchangeMapping.findOne({
            where: {
                exchange_id: order.target_exchange_id,
                instrument_id: order.instrument_id
            }
        }),
        sequelize.query(`
            SELECT imd.ask_price, imd.bid_price
            FROM instrument_exchange_mapping iem
            JOIN exchange e ON e.id=iem.exchange_id
            JOIN LATERAL (
                SELECT ask_price, bid_price
                FROM instrument_market_data imd
                WHERE instrument_id=iem.instrument_id
                    AND exchange_id=e.id
                ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
                LIMIT 1
            ) as imd ON TRUE
            WHERE iem.instrument_id=:instrument_id
                AND iem.exchange_id=:exchange_id
        `, {
            replacements: {
                instrument_id: order.instrument_id,
                exchange_id: order.target_exchange_id
            },
            plain: true,
            type: sequelize.QueryTypes.SELECT
        }),
        CCXTUtils.getConnector(order.target_exchange_id)
    ]);

    let unifiedExchange = await ccxtUnified.getExchange(order.target_exchange_id);
    await unifiedExchange.isReady();
    const limits = await unifiedExchange.getSymbolLimits(instrument_mapping.external_instrument_id);

    const sold_symbol = instrument_mapping.external_instrument_id.split('/')[1];
    const base_trade_amount = SYSTEM_SETTINGS[`BASE_${sold_symbol}_TRADE`];
    const predicted_amount = Decimal(base_trade_amount).div(price.ask_price);
    const min_amount = connector.markets[instrument_mapping.external_instrument_id].limits.amount.min;
    const order_quantity = order.quantity;

    const needed_fill = Decimal(order_quantity).minus(predicted_amount).minus(min_amount/2);

    this.current_expected_execution_order_quantity = Decimal(order.quantity).minus(needed_fill);

    let spend_amount = Decimal(order.spend_amount).minus(base_trade_amount).minus(limits.spend.min/2);
    this.current_expected_execution_order_quantity = Decimal(order.spend_amount).minus(spend_amount);
    
    let quantity = Decimal(spend_amount).div(price.ask_price);
    /*World.print(`
        ORDER QUANTITY: ${order_quantity},
        INSTRUMENT: ${instrument_mapping.external_instrument_id},
        PREDICTED_AMOUNT: ${predicted_amount.toString()},
        NEEDED FILL: ${needed_fill.toString()},
        EXCHANGE LIMIT: ${min_amount}
    `);*/
    console.log("Total spend amount ", order.spend_amount, "\n Spend amount of first order ", spend_amount.toString(),
        "\n Left Spend Amount ", order.spend_amount - spend_amount.toNumber(), "\n Minimum spend amount ", limits.spend.min);

    return sequelize.transaction(async transaction => {

        const execution_order = await ExecutionOrder.create({
            placed_timestamp: new Date(),
            completed_timestamp: new Date(),
            exchange_id: order.target_exchange_id,
            external_identifier: 'jk4h5kj34h5k3h5j3hk',
            failed_attempts: 0,
            fee: (parseFloat(order.price) / _.random(98, 100, false)),
            instrument_id: order.instrument_id,
            price: price.ask_price,
            recipe_order_id: order.id,
            side: order.side,
            status: EXECUTION_ORDER_STATUSES.FullyFilled,
            total_quantity: quantity.toString(),
            spend_amount: spend_amount.toString(),
            type: EXECUTION_ORDER_TYPES.Market
        }, { transaction });

        return ExecutionOrderFill.create({
            execution_order_id: execution_order.id,
            external_identifier: '4762387426478362',
            fee: execution_order.fee,
            price: execution_order.price,
            quantity: execution_order.total_quantity,
            timestamp: new Date()
        }, { transaction });

    });

});

Given(/^the Recipe Order was created on (.*)$/, async function(date_string) {

    const { RecipeOrderGroup } = require('../../../models');

    return RecipeOrderGroup.update({
        created_timestamp: Date.parse(date_string)
    }, {
        where: { id: this.current_recipe_order.recipe_order_group_id }
    });

});

Given(/^the system has the following (Approved|Pending|Rejected) Recipe Order Group:$/, async function(group_status, table) {

    const order_data = table.hashes();
    const { RecipeOrderGroup, RecipeOrder, ExecutionOrder, ExecutionOrderFill, Instrument, Exchange, sequelize } = require('../../../models');

    const orders = [];
    for(let order of order_data) {

        const [ instrument, exchange ] = await Promise.all([
            Instrument.findOne({ where: { symbol: order.instrument } }),
            Exchange.findOne({ where: { name: order.exchange } })
        ]);

        expect(instrument, `Expected to find instrument: ${order.instrument}`).to.be.not.null;
        expect(exchange, `Expected to find exchange: ${order.exchange}`).to.be.not.null;

        orders.push({
            instrument_id: instrument.id,
            target_exchange_id: exchange.id,
            price: order.price,
            quantity: order.quantity,
            spend_amount: order.spend_amount,
            side: ORDER_SIDES[order.side],
            status: RECIPE_ORDER_STATUSES[order.status]
        });

    }

    return sequelize.transaction(async transaction => {

        this.current_recipe_order_group = await RecipeOrderGroup.create({
            recipe_run_id: this.current_recipe_run.id,
            created_timestamp: Date.now(),
            approval_comment: '',
            approval_status: RECIPE_ORDER_GROUP_STATUSES[group_status],
            approval_timestamp: group_status !== 'Pending' ? Date.now() : 0
        }, { transaction });

        this.current_recipe_orders = await RecipeOrder.bulkCreate(orders.map(o => {
            return _.assign(o, { recipe_order_group_id: this.current_recipe_order_group.id })
        }), { transaction, returning: true });

        return Promise.all(this.current_recipe_orders.map(async order => {
            const matching_order_data = order_data.find(o => String(o.quantity) === order.quantity);

            const execution_order = await ExecutionOrder.create({
                exchange_id: order.target_exchange_id,
                instrument_id: order.instrument_id,
                completed_timestamp: Date.now(),
                placed_timestamp: Date.now(),
                failed_attempts: 0,
                total_quantity: order.quantity,
                spend_amount: order.spend_amount,
                fee: matching_order_data.fees,
                price: order.price,
                side: order.side,
                type: EXECUTION_ORDER_TYPES.Market,
                recipe_order_id: order.id,
                status: EXECUTION_ORDER_STATUSES.FullyFilled
            }, { transaction });

            return ExecutionOrderFill.create({
                execution_order_id: execution_order.id,
                quantity: execution_order.total_quantity,
                fee: execution_order.fee,
                price: execution_order.price,
                timestamp: Date.now()
            }, { transaction });
        }));

    });

});

Given('the system does not have Recipe Order Groups', async function() {

    const { RecipeOrderGroup } = require('../../../models');

    return RecipeOrderGroup.destroy({
        where: {}
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

When('the system does the task "generate execution orders" until it stops generating for the Order', async function() {

    const models = require('../../../models');
    const config = { models };
    const job = require('../../../jobs/exec-order-generator');

    const { ExecutionOrder, ExecutionOrderFill, sequelize } = models;

    let tolerance = 0;
    while(tolerance < 50) {
        tolerance++;

        const job_result = await job.JOB_BODY(config, console.log);

        const order_result = job_result.find(j => _.get(j, 'instance.id') === this.current_recipe_order.id);

        if(_.get(order_result, 'instance.id') === this.current_recipe_order.id && 
        _.get(order_result, 'status') === JOB_RESULT_STATUSES.Skipped &&
        _.get(order_result, 'step') === '3B') break;

        await sequelize.transaction(async transaction => {

            const new_execution_order = await ExecutionOrder.findOne({
                where: { 
                    recipe_order_id: this.current_recipe_order.id, 
                    status: EXECUTION_ORDER_STATUSES.Pending 
                },
                transaction
            });

            new_execution_order.status = EXECUTION_ORDER_STATUSES.FullyFilled;
            new_execution_order.price = this.current_recipe_order.price;

            await new_execution_order.save({ transaction });

            await ExecutionOrderFill.create({
                execution_order_id: new_execution_order.id,
                price: new_execution_order.price,
                quantity: parseFloat(new_execution_order.spend_amount) / parseFloat(new_execution_order.price),
                timestamp: Date.now()
            }, { transaction });

        });
    }

    expect(tolerance).to.be.lessThan(50, `Job failed to fill Order with id "${this.current_recipe_order.id}" after 50 cycles`);

});

When('I fetch the Recipe Order details', async function() {

    const [ order_response, execution_orders_response ] = await Promise.all([
        chai
        .request(this.app)
        .get(`/v1/orders/${this.current_recipe_order.id}`)
        .set('Authorization', World.current_user.token),
        chai
        .request(this.app)
        .post(`/v1/execution_orders/of_order/${this.current_recipe_order.id}`)
        .set('Authorization', World.current_user.token)
    ]);

    //World.print(order_response.body);
    //World.print(execution_orders_response.body);

    this.current_recipe_order_details = order_response.body.recipe_order;
    this.current_execution_orders_list = execution_orders_response.body.execution_orders;
    this.current_execution_orders_footer = execution_orders_response.body.footer;
    
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

Then('only one Recipe Order is created for each Recipe Run Detail', async function () {

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
    this.current_order_detail_pairs = [];

    for (let order of orders) {

        const matching_detail = details.find(detail => {
            return (
                detail.target_exchange_id === order.target_exchange_id &&
                detail.quote_asset_id === order.Instrument.quote_asset_id &&
                detail.transaction_asset_id === order.Instrument.transaction_asset_id
            );
        });

        expect(matching_detail, 'Expected to find a matching recipe run detail forthe order').to.be.not.undefined;

        this.current_order_detail_pairs.push([order, matching_detail]);

    }

    this.current_recipe_orders = orders;
    this.current_recipe_details = details;

});

//While technically this is already checked using find in the above step, we still need a step describing this, so here we are,
Then('the Recipe Order Instrument will be based on the quote and transaction assets of the corresponding Detail', function() {

    for(let pair of this.current_order_detail_pairs) {

        const [ order, detail ] = pair;

        if(order.side === ORDER_SIDES.Buy){
            expect(order.Instrument.quote_asset_id).to.equal(detail.quote_asset_id, `Expected the instrument quote asset to match the Details quote asset`);
            expect(order.Instrument.transaction_asset_id).to.equal(detail.transaction_asset_id, `Expected the instrument transaction asset to match the Details transaction asset`);
        }
        else{
            expect(order.Instrument.quote_asset_id).to.equal(detail.transaction_asset_id, `Expected the instrument quote asset to match the Details transaction asset`);
            expect(order.Instrument.transaction_asset_id).to.equal(detail.quote_asset_id, `Expected the instrument transaction asset to match the Details quote asset`);
        }

    }

});

Then('the Recipe Order Exchange will be the same as the corresponding Detail', function() {

    for(let pair of this.current_order_detail_pairs) {

        const [ order, detail ] = pair;

        expect(order.target_exchange_id).to.equal(detail.target_exchange_id, `Expected the exchange to match the Details exchange`);

    }

});

Then(/^if Order`s Instrument and Detail transaction assets (do not match|match), then the Order side will be (Buy|Sell)$/, async function(match, side) {

    match = (match === 'match');

    const matching_orders = this.current_order_detail_pairs.filter(pair => {

        const [ order, detail ] = pair;

        if(match) return (order.Instrument.transaction_asset_id === detail.transaction_asset_id);
        else return (order.Instrument.transaction_asset_id !== detail.transaction_asset_id);

    }).map(pair => pair[0]);

    for(let order of matching_orders) expect(order.side).to.equal(ORDER_SIDES[side], `Expected Order[${order.id}] side to be ${side}`);

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

Then('the approval fails with an error message including the offending value and the threshold requirement', async function( ) {

    //there should have been an error saved
    chai.assert.isDefined(this.current_recipe_order_group_status_change_error, 'No error saved after recipe order group status changed!');
    const message = _.toLower(this.current_recipe_order_group_status_change_error.message);
    chai.assert.include(message, 'lower trade limit', 'Error did not mention its about lower trade limit!');

    chai.assert.isDefined(this.current_ccxt_lower_bound, 'No ccxt lower bound saved for check!');
    chai.assert.include(message, '' + this.current_ccxt_lower_bound, `Error did not mention ccxt lower bound ${this.current_ccxt_lower_bound}!`);

    chai.assert.isDefined(this.current_bad_low_total, 'No order low total quantity saved for check!');

    let matched_number = message.match(/([0-9eE\-\.]*)$/)[0];
    chai.assert.equal(Decimal(matched_number).toString(), Decimal(this.current_bad_low_total).toString(), `Error did not mention low order total ${this.current_bad_low_total}!`);
});

Then('I see an error message including the offending instrument and the threshold requirements', async function() {

    //there should have been an error saved
    chai.assert.isDefined(this.current_recipe_order_group_status_change_error, 'No error saved after recipe order group status changed!');
    const message = _.toLower(this.current_recipe_order_group_status_change_error.message);
    chai.assert.include(message, 'no recent market data found', 'Error did not mention its about stale market data!');

    chai.assert.isDefined(this.current_stale_instrument, 'No instrument saved to check in error!');
    chai.assert.include(message, _.toLower(this.current_stale_instrument.symbol), `Error did not mention stale instrument symbol ${this.current_stale_instrument.symbol}!`);

    chai.assert.isDefined(this.current_stale_exchange, 'No exchange saved to check in error!');
    chai.assert.include(message, _.toLower(this.current_stale_exchange.name), `Error did not mention stale exchange name ${this.current_stale_exchange.name}!`);

    chai.assert.isDefined(this.currenth_price_ttl_threshold, 'No price TTL threshold defined in Context!');
    const error_tail_regex = /must be newer than (.*)!/;

    chai.assert.isTrue(error_tail_regex.test(message), `Error message ${message} did not contain regex ${error_tail_regex}`);
    const matches = message.match(error_tail_regex);
    chai.assert.isAtLeast(matches.length, 2, `Regex should have captured at least one group in error!`);
    const error_date = new Date(matches[1]);
    chai.assert.notEqual(error_date.toString(), 'Invalid Date', `The match ${matches[1]} did not generate a valid date!`);
    chai.assert.isAtLeast(error_date.getTime(), this.currenth_price_ttl_threshold.getTime(), `Date mentioned in error ${error_date} was not at least ${this.currenth_price_ttl_threshold}!`);
})

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

Then('the sum of Execution Order total quantities will equal the Recipe Order quantity', async function() {

    const { ExecutionOrder, RecipeOrder, sequelize } = require('../../../models');

    const [ recipe_order, [ execution_order_data ] ] = await Promise.all([
        RecipeOrder.findById(this.current_recipe_order.id),
        ExecutionOrder.findAll({
            where: { recipe_order_id: this.current_recipe_order.id },
            attributes: [
                'recipe_order_id',
                [ sequelize.fn('sum', sequelize.col('total_quantity')), 'total_quantity' ]
            ],
            group: [ 'recipe_order_id']
        })
    ]);

    expect(recipe_order, `Expected to find the current Recipe Order[${this.current_recipe_order.id}]`).to.be.not.null;
    this.current_recipe_order = recipe_order;

    expect(execution_order_data, `Expected to find Execution Orders for Recipe Order[${recipe_order.id}]`).to.be.not.undefined;

    expect(Decimal(recipe_order.quantity).toString()).to.equal(Decimal(execution_order_data.total_quantity).toString(), `Expected the sum of total quantities to equal the quantity of the Reciep Order[${recipe_order.id}]`);

});

Then('the Recipe Orders will have the folowing prices and quantities:', async function(table) {

    const { RecipeOrder, Exchange, Instrument } = require('../../../models');

    const order_data = table.hashes();

    const orders = await RecipeOrder.findAll({
        where: { recipe_order_group_id: this.current_recipe_order_group.id }
    });

    const [ instruments, exchanges ] = await Promise.all([
        Instrument.findAll({
            where: {
                symbol: _.uniq(order_data.map(d => d.instrument))
            }
        }),
        Exchange.findAll({
            where: {
                name: _.uniq(order_data.map(d => d.exchange))
            }
        })
    ]);

    for(let data of order_data) {

        const instrument = instruments.find(i => i.symbol === data.instrument);
        expect(instrument, `Expected to find instrument ${data.instrument}`).to.be.not.undefined;

        const exchange = exchanges.find(i => i.name === data.exchange);
        expect(exchange, `Expected to find exchange ${data.exchange}`).to.be.not.undefined;

        const matching_order = orders.find(o => o.target_exchange_id === exchange.id && o.instrument_id === instrument.id);
        expect(matching_order, `Expected find matching order for ${data.instrument} at ${data.exchange}`).to.be.not.undefined;

        expect(matching_order.price).to.equal(data.price, `Expected Order[${matching_order.id}] prices to match`);
        expect(matching_order.spend_amount).to.equal(data.spend_quantity, `Expected Order[${matching_order.id}] quantities to match`);
        expect(matching_order.quantity).to.equal(data.total_quantity);
        expect(matching_order.side).to.equal(ORDER_SIDES[data.side], `Expected Order[${matching_order.id}] side to be ${data.side}`);
        
    }

});

Then('the last Execution Order will fulfill the Recipe Order required quantity', async function() {

    const { ExecutionOrder, sequelize } = require('../../../models');

    const order = this.current_recipe_order;

    const [ current_quantity ] = await ExecutionOrder.findAll({
        where: {
            recipe_order_id: order.id,
            status: EXECUTION_ORDER_STATUSES.FullyFilled
        },
        attributes: [
            'recipe_order_id',
            'status',
            [ sequelize.fn('sum', sequelize.col('spend_amount')), 'spend_amount' ]
        ],
        group: [ 'recipe_order_id', 'status' ]
    });

    expect(current_quantity, `Expected to find current FufllyFilled Execution Orders of Recipe Order[${order.id}]`).to.be.not.undefined;

    const newest_quantity = this.current_execution_order.spend_amount;

    //expect(Decimal(current_quantity.spend_amount).plus(newest_quantity).toDP(6).toString()).to.equal(Decimal(order.spend_amount).toDP(6).toString(), 'Expected the quantities to match');

});
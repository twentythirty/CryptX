"use strict";

const {
  logAction
} = require('../utils/ActionLogUtil');
const ccxtUtils = require('../utils/CCXTUtils');

const action_path = 'cold_storage_transfers';

const actions = {
  missing_account: `${action_path}.missing_account`,
  zero_balance: `${action_path}.zero_balance`
};

/**
 * Job will fetch order groups with completed orders, which also are missing cold storage transfers.
 * It will create a cold storage transfer for each completed order.
 */
module.exports.SCHEDULE = "* */45 * * * *";
module.exports.NAME = "TRANSFER_GENERATOR";
module.exports.JOB_BODY = async (config, log) => {

    const { models } = config;
    const { sequelize, ColdStorageTransfer, ColdStorageAccount } = models;

    log('1. Fetching compelted orders that are missing a cold storage transfer');

    let [ err, orders ] = await to(sequelize.query(`
        WITH completed_orders_without_transfers AS (
            SELECT * FROM recipe_order AS ro WHERE ro.status = :completed_status AND NOT EXISTS (
                SELECT * FROM cold_storage_transfer AS cst WHERE cst.recipe_run_order_id = ro.id
            )
        ),
        order_groups AS (
            SELECT  
                rog.*,
                CASE
                    WHEN order_count.uncompleted_orders = 0 OR order_count.uncompleted_orders IS NULL
                    THEN TRUE
                    ELSE FALSE
                END AS is_completed
            FROm recipe_order_group AS rog
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS uncompleted_orders, ro.recipe_order_group_id FROM recipe_order AS ro
                WHERE ro.status != :completed_status
                GROUP BY ro.recipe_order_group_id
            ) AS order_count ON order_count.recipe_order_group_id = rog.id
        )
        
        SELECT 
            og.recipe_run_id,
            ir.strategy_type,
            i.transaction_asset_id,
            i.quote_asset_id,
            a.symbol AS asset,
            ro.*
        FROM order_groups AS og
        JOIN completed_orders_without_transfers AS ro ON ro.recipe_order_group_id = og.id
        JOIN recipe_run AS rr ON og.recipe_run_id = rr.id
        JOIn investment_run AS ir ON rr.investment_run_id = ir.id
        JOIN instrument AS i ON ro.instrument_id = i.id
        JOIN asset AS a ON i.transaction_asset_id = a.id
        WHERE og.is_completed IS TRUE AND ro.target_exchange_id = 1
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            completed_status: RECIPE_ORDER_STATUSES.Completed
        }
    }));

    if(err) {
        log(`[ERROR.1A] Error occured during order fetching: ${err.message}`);
        return [];
    }
    if(!orders.length) {
        log(`[WARN.1A] No orders were found with missing transfers, skipping..`);
        return [];
    }

    let accounts;
    [ err, accounts ] = await to(ColdStorageAccount.findAll({ raw: true }));

    const exchange_ids = _.uniq(orders.map(o => o.target_exchange_id));

    let result;
    [ err, result ] = await to(Promise.all(exchange_ids.map(async id => {
        const connector = await ccxtUtils.getConnector(id);
        const [ balance, fees ] = await Promise.all([
            connector.fetchBalance(),
            getWithDrawFees(connector)
        ]);
        return [ id, { balance: balance.free, fee: fees }]; //Create exchange id and info pairs
    })));

    if(err) {
        log(`[ERROR.1B] Error occured when fetching exchange balances: ${err.message}`);
        return [];
    }

    let exchange_info = _.fromPairs(result);
    
    const order_groups = _.groupBy(orders, 'recipe_order_group_id');
    
    log(`2. Creating transfers for ${orders.length} completed orders`);

    let errors = [];
    let transfers = await Promise.all(_.map(order_groups, async (group_orders, group_id) => {

        let group_transfers = [];

        for(let order of group_orders) {

            const matching_account = accounts.find(a => a.asset_id === order.transaction_asset_id && a.strategy_type === order.strategy_type);
            if(!matching_account) {
                log(`[ERROR.2A](RO-${order.id}) Error: order does not have a matching ${_.invert(STRATEGY_TYPES)[order.strategy_type]} cold storage account for ${order.asset}`);
    
                errors.push([actions.missing_account, {
                    args: {
                        strategy_type: _.invert(STRATEGY_TYPES)[order.strategy_type],
                        asset: order.asset
                    },
                    relations: {
                        recipe_order_id: order.id,

                    },
                    log_level: ACTIONLOG_LEVELS.Error
                }]);
    
                return;
            }
    
            const asset_balance = _.get(exchange_info, `[${order.target_exchange_id}].balance[${order.asset}]`, 0);
            const withdraw_fee = _.get(exchange_info, `[${order.target_exchange_id}].fee[${order.asset}]`, 0);
    
            if(asset_balance === 0) {
                log(`[ERROR.2B](RO-${order.id}) Error: transfer cannot be created as the balance of ${order.asset} is 0`);
    
                errors.push([actions.zero_balance, {
                    args: {
                        asset: order.asset
                    },
                    relations: {
                        recipe_order_id: order.id,
                        exchange_id: order.target_exchange_id
                    },
                    log_level: ACTIONLOG_LEVELS.Error
                }]);
    
                continue;
            }
    
            group_transfers.push({
                amount: _.clamp(parseFloat(order.quantity), asset_balance) - withdraw_fee,
                asset_id: matching_account.asset_id,
                cold_storage_account_id: matching_account.id,
                fee: withdraw_fee,
                recipe_run_id: order.recipe_run_id,
                recipe_run_order_id: order.id,
                status: COLD_STORAGE_ORDER_STATUSES.Pending
            });
    
        }

        return group_transfers;

    }));

    //Log error if they happened
    if(errors.length) await Promise.all(errors.map(error => logAction(...error)));

    transfers = _.flatten(transfers).filter(t => t);

    log(`3. After analyzes, ${transfers.length} transfers will be created`);

    if(!transfers.length) return [];
    
    [ err, transfers ] = await to(ColdStorageTransfer.bulkCreate(transfers, { returning: true }));

    if(err) log(`[ERROR.3A] Error occured during transfer saving: ${err.message}`);

    return transfers;


    async function getWithDrawFees(connector) {
        //OKEx is an exception
        if(connector.id === 'okex') return OKEX_WITHDRAW_FEES;

        const fees = await connector.fetchFundingFees();
        
        return fees.withdraw;
        
    }

}
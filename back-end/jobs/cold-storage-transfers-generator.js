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
module.exports.SCHEDULE = "0 */1 * * * *";
module.exports.NAME = "TRANSFER_GENERATOR";
module.exports.JOB_BODY = async (config, log) => {

    const { models } = config;
    const { sequelize, ColdStorageTransfer, ColdStorageAccount } = models;

    log('1. Fetching compelted orders that are missing a cold storage transfer');

    let [ err, orders ] = await to(sequelize.query(`
        WITH completed_orders_without_transfers AS (
            SELECT 
                ro.id,
                ro.instrument_id,
                ro.recipe_order_group_id,
                ro.target_exchange_id,
                SUM(eof.quantity) AS quantity
            FROM recipe_order AS ro
            JOIN execution_order AS eo ON eo.recipe_order_id = ro.id
            JOIN instrument AS i on eo.instrument_id = i.id
            JOIN LATERAL (
                SELECT
                    (CASE WHEN (i.quote_asset_id = eof.fee_asset_id)
                    THEN eof.quantity
                    ELSE eof.quantity - eof.fee
                    END) AS quantity,
                    eof.execution_order_id
                FROM execution_order_fill AS eof
            ) AS eof ON eof.execution_order_id = eo.id
            WHERE ro.status = :completed_status AND NOT EXISTS (
                SELECT * FROM cold_storage_transfer AS cst WHERE cst.recipe_run_order_id = ro.id
            )
            GROUP BY ro.id, ro.instrument_id, ro.recipe_order_group_id
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
            cta.id AS cold_storage_account_id,
            ro.*
        FROM order_groups AS og
        JOIN completed_orders_without_transfers AS ro ON ro.recipe_order_group_id = og.id
        JOIN recipe_run AS rr ON og.recipe_run_id = rr.id
        JOIn investment_run AS ir ON rr.investment_run_id = ir.id
        JOIN instrument AS i ON ro.instrument_id = i.id
        JOIN asset AS a ON i.transaction_asset_id = a.id
        LEFT JOIN cold_storage_account AS cta ON ir.strategy_type = cta.strategy_type AND a.id = cta.asset_id
        WHERE og.is_completed IS TRUE
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

    const order_groups = _.groupBy(orders, 'recipe_order_group_id');

    const exchange_ids = _.uniq(orders.map(o => o.target_exchange_id));
    let result;
    [ err, result ] = await to(Promise.all(exchange_ids.map(async id => {

        const connector = await ccxtUtils.getConnector(id);

        const fees = await connector.fetchFundingFees();

        return [ id, fees.withdraw ];

    })));

    if(err) {
        log(`[ERROR.2A] Error occured doing fee fetching: ${err.message}`);
        return;
    }

    const exchanges_fees = _.fromPairs(result);
    
    log(`2. Creating transfers for ${orders.length} completed orders`);

    let errors = [];
    let transfers = await Promise.all(_.map(order_groups, async (group_orders, group_id) => {

        let group_transfers = [];
        let group_errors = [];

        for(let order of group_orders) {

            if(!order.cold_storage_account_id) {
                log(`[ERROR.2A](RO-${order.id}) Error: order does not have a matching ${_.invert(STRATEGY_TYPES)[order.strategy_type]} cold storage account for ${order.asset}`);
    
                group_errors.push([actions.missing_account, {
                    args: {
                        strategy_type: _.invert(STRATEGY_TYPES)[order.strategy_type],
                        asset: order.asset
                    },
                    relations: {
                        recipe_order_id: order.id,

                    },
                    log_level: ACTIONLOG_LEVELS.Error
                }]);
    
                continue;
            }

            group_transfers.push({
                amount: order.quantity,
                asset_id: order.transaction_asset_id,
                cold_storage_account_id: order.cold_storage_account_id,
                fee: _.get(exchanges_fees, `${order.target_exchange_id}.${order.asset}`, 0),
                recipe_run_id: order.recipe_run_id,
                recipe_run_order_id: order.id,
                status: COLD_STORAGE_ORDER_STATUSES.Pending
            });
    
        }

        if(group_errors.length) {
            errors = errors.concat(group_errors);
            return;
        };

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

}
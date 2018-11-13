'use strict';
const ccxtUtils = require('../utils/CCXTUtils');
const Decimal = require('decimal.js');

//everyday, every 5 seconds
module.exports.SCHEDULE = '*/5 * * * *';
module.exports.NAME = 'ORD_ST_CHANGE';
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const sequelize = models.sequelize;


    const RECIPE_ORDER_TERMINAL_STATUSES = [
        RECIPE_ORDER_STATUSES.Completed,
        RECIPE_ORDER_STATUSES.Rejected,
        RECIPE_ORDER_STATUSES.Cancelled,
        RECIPE_ORDER_STATUSES.Failed
    ];
    const EXECUTION_ORDER_ACTIVE_STATUSES = [
        EXECUTION_ORDER_STATUSES.Pending,
        EXECUTION_ORDER_STATUSES.InProgress
    ]

    //mark-sweep begin
    let to_change_orders = {}

    //returns true if indeed this is a new mark
    const order_status_from_to = (ord_id, from_status, to_status) => {
        //insert possible change of recipe order record status
        //only if not same
        if (from_status != to_status) {
            to_change_orders[ord_id] = to_status

            return true
        } else {
            //otherwise try remove key from objct in case otehr step added it
            delete to_change_orders[ord_id]

            return false
        }
    }


    //mark step 1 - execution orders
    return sequelize.query(`

    SELECT ro.id,
        ro.status,
        COALESCE(eo_stats.all_execution, 0) AS all_execution,
        COALESCE(eo_stats.failed_execution, 0) AS failed_execution,
        COALESCE(eo_stats.current_execution, 0) AS current_execution
    FROM recipe_order ro
    JOIN recipe_order_group rog ON rog.id=ro.recipe_order_group_id
    LEFT JOIN
    ( SELECT recipe_order_id,
            count(id) AS all_execution,
            sum(CASE WHEN status = :status_execution_order_failed THEN 1 ELSE 0 END) AS failed_execution,
            sum(CASE WHEN status IN (:statuses_execution_order_active) THEN 1 ELSE 0 END) AS current_execution
    FROM execution_order
    GROUP BY recipe_order_id ) AS eo_stats ON ro.id = eo_stats.recipe_order_id
    WHERE ro.status NOT IN (:statuses_recipe_order_done)
        AND rog.approval_status <> :status_recipe_order_pending
    `, {
        replacements: {
            status_execution_order_failed: EXECUTION_ORDER_STATUSES.Failed,
            statuses_execution_order_active: EXECUTION_ORDER_ACTIVE_STATUSES,
            statuses_recipe_order_done: RECIPE_ORDER_TERMINAL_STATUSES,
            status_recipe_order_pending: RECIPE_ORDER_GROUP_STATUSES.Pending
        },
        type: sequelize.QueryTypes.SELECT
    }).then(exec_order_stats => {

        log(`MARK.1: Analyzing ${exec_order_stats.length} recipe orders...`)

        //stats for logging
        let to_executing = 0, to_failed = 0;

        _.forEach(exec_order_stats, record => {

            const {
                id: order_id,
                status: order_status,
                all_execution: exec_count,
                failed_execution: exec_failed,
                current_execution: exec_curr
            } = record;

            //no execution orders made yet, or at least one is executing, set order to executing
            if (exec_count <= 0 || exec_curr > 0) {
                if (order_status_from_to(order_id, order_status, RECIPE_ORDER_STATUSES.Executing)) {
                    to_executing++;
                }
            }
            //all known execution orders failed, fail the recipe order
            if (exec_count > 0 && exec_count == exec_failed) {
                if (order_status_from_to(order_id, order_status, RECIPE_ORDER_STATUSES.Failed)) {
                    to_failed++;
                }
            }
        })

        log(`MARK.1: Marked ${to_executing} orders for execution and ${to_failed} for failure...`)

        return sequelize.query(`
            SELECT ro.id,
                    ro.stop_gen,
                    ro.status,
                    ro.quantity,
                    ro.spend_amount,
                    COALESCE(fills_stats.fills_quantity, 0) AS fills_quantity,
                    COALESCE(fills_stats.sold_quantity, 0) AS sold_quantity
            FROM recipe_order ro
            LEFT JOIN
            ( SELECT recipe_order_id,
                        sum(filled_quantity) AS fills_quantity,
                        sum(sold_quantity) AS sold_quantity
                FROM
                    (SELECT eo.recipe_order_id,
                            eo.id,
                            COALESCE(sum(eof.quantity), 0) AS filled_quantity,
                            COALESCE(sum(eof.quantity * eof.price), 0) AS sold_quantity     
                    FROM execution_order eo
                    LEFT JOIN execution_order_fill eof ON eof.execution_order_id = eo.id
                    GROUP BY eo.id) AS fills
                GROUP BY fills.recipe_order_id) AS fills_stats ON fills_stats.recipe_order_id = ro.id
                WHERE ro.status NOT IN (:statuses_recipe_order_done)

        `, {
            replacements: {
                statuses_recipe_order_done: RECIPE_ORDER_TERMINAL_STATUSES
            },
            type: sequelize.QueryTypes.SELECT
        })
    }).then(exec_fill_stats => {

        log(`MARK.2: Analyzing ${exec_fill_stats.length} recipe order fills...`)

        let to_completed = 0;

        _.forEach(exec_fill_stats, record => {

            const {
                id: order_id,
                status: order_status,
                quantity: order_quantity,
                spend_amount: spend_amount,
                fills_quantity,
                sold_quantity,
                stop_gen
            } = record;

            if (stop_gen) {
                if (order_status_from_to(order_id, order_status, RECIPE_ORDER_STATUSES.Completed)) {
                    to_completed++;
                }
            } else if (Decimal(spend_amount).lte(Decimal(sold_quantity))) {
                if (order_status_from_to(order_id, order_status, RECIPE_ORDER_STATUSES.Completed)) {
                    to_completed++;
                }
            }
        })  

        log(`MARK.2: Marked ${to_completed} orders for completion...`);

        const num_changes = Object.keys(to_change_orders).length;

        log(`SWEEP.1: Generating on ${num_changes} recipe orders... ${num_changes <= 0? 'NO NEED! Finishing...' : ''}`)

        if (num_changes > 0) {

            const change_tuples = _.join(_.map(to_change_orders, (status, ord_id) => `(${ord_id}, ${status})`), ',\n');

            return sequelize.query(`
                UPDATE recipe_order
                SET
                    status = changes.status
                FROM (
                    VALUES
                        ${change_tuples}
                ) AS changes (ord_id, status)
                WHERE recipe_order.id = changes.ord_id
            `)

        } else {

            return Promise.resolve('Nothing to change!');
        }
    })
};
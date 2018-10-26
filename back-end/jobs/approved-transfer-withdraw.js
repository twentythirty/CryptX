const ccxtUnified = require('../utils/ccxtUnified');
const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'cold_storage_transfers';
const actions = {
    connector_error: `${action_path}.connector_error`,
    withdraw_error: `${action_path}.withdraw_error`,
    placed: `${action_path}.placed`
};

//Every 20 minutes for now
module.exports.SCHEDULE = "* */20 * * * *";
module.exports.NAME = "TRANSFER_WITHDRAW";
module.exports.JOB_BODY = async (config, log) => {

    const { ColdStorageTransfer, sequelize } = config.models;

    const updateTransferStatus = (id, status, external_identifier, fee) => {
        return ColdStorageTransfer.update({
            status,
            placed_timestamp: status === COLD_STORAGE_ORDER_STATUSES.Sent ? Date.now() : null,
            completed_timestamp: status === COLD_STORAGE_ORDER_STATUSES.Completed ? Date.now() : undefined,
            external_identifier,
            fee
        }, {
            where: { id },
            limit: 1
        })
    };

    log('1 Fetching approved Cold Storage Transfers');

    let [ err, transfers ] = await to(sequelize.query(`
        SELECT
            cst.id,
            cst.status,
            cst.amount,
            cst.placed_timestamp,
            cst.completed_timestamp,
            csa.address,
            csa.tag,
            ex.id AS exchange_id,
            ex.name AS exchange_name,
            ex.api_id AS exchange_api_id,
            a.symbol AS asset    
        FROM public.cold_storage_transfer AS cst
        JOIN public.cold_storage_account AS csa ON csa.id = cst.cold_storage_account_id
        JOIN public.asset AS a ON a.id = cst.asset_id
        JOIn public.recipe_order AS ro ON ro.id = cst.recipe_run_order_id
        JOIN public.exchange AS ex ON ex.id = ro.target_exchange_id
        JOIN public.exchange_account AS exa ON exa.asset_id = cst.asset_id AND exa.exchange_id = ro.target_exchange_id
        WHERE cst.status = ${COLD_STORAGE_ORDER_STATUSES.Approved}
    `, {
        type: sequelize.QueryTypes.SELECT
    }));

    if(err) {
        log(`[ERROR.1A] Error occured during fetching of approved transfers: ${err.messgae}`);
        return;
    }

    if(!transfers.length) {
        log(`[WARN.1A] No approved transfers were found, skipping...`);
        return;
    }

    log('2. Grouping transfers by exchange');

    const transfers_by_exchange = _.groupBy(transfers, 'exchange_api_id');

    return Promise.all(_.map(transfers_by_exchange, async (exchange_transfers, exchange_api_id) => {

        const connector = await ccxtUnified.getExchange(exchange_api_id);
        [ err ] = await to(connector.isReady());

        if(err) {
            log(`[ERROR.2A] Failed to preprare ccxt connection for ${exchange_api_id}: ${err.message}`);
            await logAction(actions.connector_error, {
                args: {
                    error: err.message,
                    exchange: exchange_transfers[0].exchange_name
                },
                relations: {
                    exchange_id: exchange_transfers[0].exchange_id
                },
                log_level: ACTIONLOG_LEVELS.Error
            })
            return;
        }
        
        log(`3. Creating ${exchange_transfers.length} withdraw requests from ${exchange_transfers[0].exchange_name}`);
        return Promise.all(_.map(exchange_transfers, async transfer => {

            /**
             * This might look weird, but here is the idea:
             * We mark the transfer as Sent just before the actual withdraw and then do a withdraw and update again.
             * If the withdraw fails, it will update the status to Failed.
             * This way, in case the transfer fails to update after a successful withdraw, the job would
             * create another withdraw in the next cycle. But if we ensure that it is marked differently first,
             * that won't happen.
             * Having a failed transfer with status sent, is better than have a successful withdraw and a transfer with status approved.
             * Perhaps a better solution will be found later.
             */
            [ err ] = await to(updateTransferStatus(transfer.id, COLD_STORAGE_ORDER_STATUSES.Sent));
            if(err) {
                log(`[ERROR.3A](${exchange_api_id})(CST-${transfer.id}) Error occured during transfer status update: ${err.message}`);
                return;
            }

            let withdraw;
            const { asset, amount, address, tag } = transfer;
            [ err, withdraw ] = await to(connector.withdraw(asset, amount, address, tag));

            if(err) {
                //console.log(JSON.stringify(err, null, 4));
                log(`[ERROR.3B](${exchange_api_id})(CST-${transfer.id}) Error occured during withdraw creation: ${err.message}`);
                await logAction(actions.withdraw_error, {
                    args: {
                        error: err.message,
                        exchange: transfer.exchange_name
                    },
                    relations: {
                        exchange_id: transfer.exchange_id,
                        cold_storage_transfer_id: transfer.id
                    },
                    log_level: ACTIONLOG_LEVELS.Error
                });
                [ err ] = await to(updateTransferStatus(transfer.id, COLD_STORAGE_ORDER_STATUSES.Failed));

                if(err) {
                    log(`[ERROR.3C](${exchange_api_id})(CST-${transfer.id}) Error occured during transfer status update: ${err.message}`);
                }

                return;
            }
            /*
            console.log(`
                TRANSFER ID: ${transfer.id},
                WITHDRAW: ${JSON.stringify(withdraw, null, 4)}
            `);
            */
            log(`4.(${exchange_api_id})(CST-${transfer.id}) Withdraw request created with id ${withdraw.id}`);

            await logAction(actions.placed, {
                args: {
                    id: withdraw.id
                },
                relations: {
                    exchange_id: transfer.exchange_id,
                    cold_storage_transfer_id: transfer.id
                }
            });
            
            const fee = _.get(withdraw, 'info.fees', 0); //Attempt to exctract fee from Bitfinex and Binance response

            [ err ] = await to(updateTransferStatus(transfer.id, COLD_STORAGE_ORDER_STATUSES.Sent, withdraw.id, fee));

            if(err) {
                log(`[ERROR.4A](${exchange_api_id})(CST-${transfer.id}) Error occured during transfer status update: ${err.message}`);
            }

            return;

        }));

    }));

};
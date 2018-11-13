const ccxtUnified = require('../utils/ccxtUnified');
const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'cold_storage_transfers';
const actions = {
    connector_error: `${action_path}.connector_error`,
    withdraw_error: `${action_path}.withdraw_error`,
    placed: `${action_path}.placed`,
    zero_balance: `${action_path}.zero_balance`
};

const require_fund_transfer = ['okex'];

//Every 3 minutes for now
module.exports.SCHEDULE = "0 */3 * * * *";
module.exports.NAME = "TRANSFER_WITHDRAW";
module.exports.JOB_BODY = async (config, log) => {

    const { ColdStorageTransfer, sequelize } = config.models;

    log('1 Fetching approved Cold Storage Transfers');

    let [ err, transfers ] = await to(sequelize.query(`
        SELECT
            cst.id,
            cst.status,
            cst.amount,
            cst.fee,
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
        JOIN public.recipe_order AS ro ON ro.id = cst.recipe_run_order_id
        JOIN public.exchange AS ex ON ex.id = ro.target_exchange_id
        LEFT JOIN public.exchange_account AS exa ON exa.asset_id = cst.asset_id AND exa.exchange_id = ro.target_exchange_id
        WHERE cst.status = ${COLD_STORAGE_ORDER_STATUSES.Approved}
    `, {
        type: sequelize.QueryTypes.SELECT,
        model: ColdStorageTransfer
    }));

    if(err) {
        log(`[ERROR.1A] Error occured during fetching of approved transfers: ${err.messgae}`);
        return;
    }

    if(!transfers.length) {
        log(`[WARN.1A] No approved transfers were found, skipping...`);
        return;
    }

    log('2. Fetching exchange balance and fees');

    const exchange_ids = _.uniq(transfers.map(o => o.getDataValue('exchange_api_id')));
    
    let result;
    [ err, result ] = await to(Promise.all(exchange_ids.map(async id => {
        const connector = await ccxtUnified.getExchange(id);
        await connector.isReady();

        //In case this is one of those exchanges that require funds to be transfered, then it will attempt to do so.
        if(require_fund_transfer.includes(connector.api_id)) {
            let fund_transfer = {
                from: 'trading',
                to: 'wallet',
                currencies: transfers.map(t => {
                    return {
                        currency: t.getDataValue('asset'),
                        amount: t.amount
                    };
                })
            };

            await connector.transferFunds(fund_transfer);
        }

        const [ balance, fees ] = await Promise.all([
            connector._connector.fetchBalance(),
            connector._connector.fetchFundingFees()
        ]);
        return [ id, { balance: balance.free, fee: fees.withdraw, connector }]; //Create exchange id and info pairs
    })));

    if(err) {
        log(`[ERROR.2A] Error occured doing balance handling: ${err.message}`);
        return;
    }

    let exchange_info = _.fromPairs(result);

    log('3. Grouping transfers by exchange');

    const transfers_by_exchange = _.groupBy(transfers, t => t.getDataValue('exchange_api_id'));

    return Promise.all(_.map(transfers_by_exchange, async (exchange_transfers, exchange_api_id) => {

        const connector = exchange_info[exchange_api_id].connector;
        
        log(`4. Creating ${exchange_transfers.length} withdraw requests from ${exchange_transfers[0].exchange_name}`);
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
            transfer.status = COLD_STORAGE_ORDER_STATUSES.Sent;
            [ err ] = await to(transfer.save());
            if(err) {
                log(`[ERROR.4A](${exchange_api_id})(CST-${transfer.id}) Error occured during transfer status update: ${err.message}`);
                return;
            }

            const asset = transfer.getDataValue('asset');
            const balance = exchange_info[exchange_api_id].balance[asset] || 0;
            const fee = exchange_info[exchange_api_id].fee[asset] || 0;

            transfer.fee = fee;

            if(balance === 0) {
                log(`[ERROR.4B](CST-${transfer.id}) Error: transfer cannot be created as the balance of ${transfer.getDataValue('asset')} is 0`);
                await logAction(actions.zero_balance, {
                    args: {
                        asset: transfer.getDataValue('asset')
                    },
                    relations: {
                        cold_storage_transfer_id: transfer.id,
                        exchange_id: transfer.getDataValue('exchange_id')
                    },
                    log_level: ACTIONLOG_LEVELS.Error
                });

                transfer.status = COLD_STORAGE_ORDER_STATUSES.Failed;
                transfer.fee = null;
                return transfer.save();
            }
            //adjust amount
            if(Decimal(transfer.amount).gt(balance)) {
                transfer.setAmount(balance, 'balance', balance);
            }

            let withdraw;
            [ err, withdraw ] = await to(connector.withdraw(transfer));

            if(err) {
                console.log(JSON.stringify(err, null, 4));
                log(`[ERROR.4C](${exchange_api_id})(CST-${transfer.id}) Error occured during withdraw creation: ${err.message}`);
                await logAction(actions.withdraw_error, {
                    args: {
                        error: err.message,
                        exchange: transfer.exchange_name
                    },
                    relations: {
                        exchange_id: transfer.getDataValue('exchange_id'),
                        cold_storage_transfer_id: transfer.id
                    },
                    log_level: ACTIONLOG_LEVELS.Error
                });

                transfer.status = COLD_STORAGE_ORDER_STATUSES.Failed;
                transfer.fee = null;
                return transfer.save();
            }
            
            console.log(`
                TRANSFER ID: ${transfer.id},
                WITHDRAW: ${JSON.stringify(withdraw, null, 4)}
            `);
            
            log(`5.(${exchange_api_id})(CST-${transfer.id}) Withdraw request created with id ${withdraw.id}`);

            await logAction(actions.placed, {
                args: {
                    id: withdraw.id
                },
                relations: {
                    exchange_id: transfer.getDataValue('exchange_id'),
                    cold_storage_transfer_id: transfer.id
                }
            });

            transfer.external_identifier = withdraw.id;
            transfer.status = COLD_STORAGE_ORDER_STATUSES.Sent;
            transfer.placed_timestamp = Date.now();

            return transfer.save();

        }));

    }));

};
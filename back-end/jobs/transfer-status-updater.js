'use strict';
const ccxtUnified = require('../utils/ccxtUnified');

const status_map = {
    'pending': COLD_STORAGE_ORDER_STATUSES.Sent,
    'ok': COLD_STORAGE_ORDER_STATUSES.Completed,
    'failed': COLD_STORAGE_ORDER_STATUSES.Failed,
    'canceled': COLD_STORAGE_ORDER_STATUSES.Canceled
};

//everyday, every 30 minutes
module.exports.SCHEDULE = '* */30 * * *';
module.exports.NAME = 'TRANSFER_STATUS_UPDATER';
module.exports.JOB_BODY = async (config, log) => {

    const { models } = config;
    const { sequelize, ColdStorageTransfer } = models;

    log('1. Fetching sent cold storage transfers');

    let [ err, transfers ] = await to(sequelize.query(`
        SELECT
            cst.*,
            ro.target_exchange_id AS exchange_id,
            ex.api_id AS exchange_api_id,
            asset.symbol AS asset
        FROM cold_storage_transfer AS cst
        JOIN asset on cst.asset_id = asset.id
        JOIN recipe_order AS ro ON recipe_run_order_id = ro.id
        JOIN exchange AS ex ON ro.target_exchange_id = ex.id
        WHERE cst.status = :status
    `, {
        type: sequelize.QueryTypes.SELECT,
        model: ColdStorageTransfer,
        replacements: {
            status: COLD_STORAGE_ORDER_STATUSES.Sent
        }
    }));
    
    if(err) return log(`[ERROR.1A] Error occured during transfers fetch: ${err.message}`);
    if(!transfers.length) return log('[WARN.1A] No sent transfers, ending here...');

    const transfers_by_exchange = _.groupBy(transfers, 'dataValues.exchange_api_id');

    log(`2. Checking ${transfers.length} transfers from ${_.size(transfers_by_exchange)} Exchanges`);
    return Promise.all(_.map(transfers_by_exchange, async (exchange_transfers, exchange_api_id) => {

        let connector = await ccxtUnified.getExchange(exchange_api_id);

        if(err) return log(`[ERROR.2A](${exchange_api_id}) Error occured during exchange connector fetching: ${err.message}`);

        let withdraws;
        [ err, withdraws ] = await to(connector.fetchWithdraws(exchange_transfers.map(et => et.toJSON())));

        if(err) return log(`[ERROR.2B](${exchange_api_id}) Error occured during withdraw fetching: ${err.message}`);
        
        log(`3.(${exchange_api_id}) Checking ${withdraws.length} transfers for updates`);

        return Promise.all(_.map(exchange_transfers, async transfer => {

            const matching_withdraw = withdraws.find(w => w.id === transfer.external_identifier);

            if(!matching_withdraw) return log(`[ERROR.3A](CST-${transfer.id}) Could not find a matching withdraw with external id "${transfer.external_identifier}"`);

            transfer.status = status_map[matching_withdraw.status] || COLD_STORAGE_ORDER_STATUSES.Sent; //Bitfinex does not map all status for some reason

            if(_.get(matching_withdraw, 'fee.cost')) transfer.fee = matching_withdraw.fee.cost;

            switch(transfer.status) {

                case COLD_STORAGE_ORDER_STATUSES.Canceled:
                    log(`4.(CST-${transfer.id}) Transfer was canceled`);
                    break;

                case COLD_STORAGE_ORDER_STATUSES.Failed:
                    log(`4.(CST-${transfer.id}) Transfer failed on the exchange`);
                    break;

                case COLD_STORAGE_ORDER_STATUSES.Completed:
                    log(`4.(CST-${transfer.id}) Transfer successfully completed`);
                    transfer.completed_timestamp = new Date();
                    break;

                default:
                    log(`4.(CST-${transfer.id}) Transfer is still being processed...`);
                    break;

            }

            if(transfer.changed()) {

                [ err ] = await to(transfer.save());

                if(err) return log(`[ERROR.4A](CST-${transfer.id}) Error occured during transfer database update: ${err.message}`);

            }

            return transfer;

        }));

    }));

};
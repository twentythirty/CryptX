'use strict';

const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;

const createExchangeAccount = async (type, asset_id, exchange_id, external_identifier) => {
    if (
        !type ||
        !asset_id ||
        !exchange_id ||
        !external_identifier
    ) TE('Creating an exchange account requires to specify an account type, asset id, exchange id and external identifier (account address)');

    const account_types = Object.values(MODEL_CONST.EXCHANGE_ACCOUNT_TYPES);

    if (!account_types.includes(type)) TE(`Invalid account type`);

    let [err, [found_asset, found_exchange, found_account]] = await to(Promise.all([
        Asset.count({
            where: { id: asset_id }
        }),
        Exchange.count({
            where: { id: exchange_id }
        }),
        ExchangeAccount.count({
            where: {
                type, asset_id, exchange_id
            }
        })
    ]));

    if (err) TE(err.message);
    if (!found_asset) TE(`Asset not found with id ${asset_id}`);
    if (!found_exchange) TE(`Exchange not found with id ${exchange_id}`);
    if (found_account) TE(`Exchange account already exists with the specified parameters`);

    return ExchangeAccount.create({
        type,
        asset_id,
        exchange_id,
        external_identifier
    });

};
module.exports.createExchangeAccount = createExchangeAccount;
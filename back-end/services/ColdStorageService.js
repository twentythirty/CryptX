'use strict';

const ColdStorageCustodian = require('../models').ColdStorageCustodian;
const ColdStorageAccount = require('../models').ColdStorageAccount;
const ColdStorageTransfer = require('../models').ColdStorageTransfer;
const sequelize = require('../models').sequelize;

const Asset = require('../models').Asset;

const { fn: seq_fn, where: seq_where, col: seq_col } = require('../models').sequelize; 

const { logAction } = require('../utils/ActionLogUtil');

const non_crypto_assets = ['USD'];

const createCustodian = async (name) => {
    
    if(!_.isString(name) || _.isEmpty(name)) {
        TE(`Custodian name must bit a valid, non-empty string`);
    }
    
    let [ err, existing_custodian ] = await to(ColdStorageCustodian.count({
        where: seq_where(seq_fn('lower', seq_col('name')), seq_fn('lower', name))
    }));

    if(err) TE(err.message);
    if(existing_custodian) TE(`Custodian with the name "${name}" already exists`);

    let custodian = null;
    [ err, custodian ] = await to(ColdStorageCustodian.create({ name }));

    if(err) TE(err.message);

    return custodian;
};
module.exports.createCustodian = createCustodian;

const createColdStorageAccount = async (strategy_type, asset_id, cold_storage_custodian_id, address, tag = null) => {
    
    if(
        !_.isNumber(strategy_type) ||
        !_.isNumber(asset_id) || 
        !_.isNumber(cold_storage_custodian_id) ||
        !_.isString(address) ||
        (!_.isEmpty(tag) && !_.isString(tag))
    ) TE(`Type, asset id, custodian id or account address is not valid or not provided`);

    if(!Object.values(STRATEGY_TYPES).includes(strategy_type)) TE(`Strategy type "${strategy_type}" is not valid`);

    let [ err, found_account ] = await to(ColdStorageAccount.count({
        where: { strategy_type, asset_id, cold_storage_custodian_id }
    }));

    if(err) TE(err.message);
    if(found_account) TE(`Account with the same strategy, asset and custodian already exists`);

    let result;
    [ err, result ] = await to(Promise.all([
        Asset.findById(asset_id),
        ColdStorageCustodian.findById(cold_storage_custodian_id)
    ]));

    if(err) TE(err.message);

    const [ found_asset, found_custodian ] = result;

    if(!found_asset) TE(`Asset with id ${asset_id} was not found`);
    if(non_crypto_assets.includes(found_asset.symbol)) TE(`Asset "${found_asset.symbol}" is not a cryptocurrency`);
    
    if(!found_custodian) TE(`Custodian with id ${cold_storage_custodian_id} was not found`);

    let account = null;
    [ err, account ] = await to(sequelize.transaction(transaction => {

        return ColdStorageAccount.count({
            where: { strategy_type, asset_id, cold_storage_custodian_id }
        }).then(found_account => {

            if(found_account) TE(`Account with the same strategy, asset and custodian already exists`);

            return ColdStorageAccount.create({
                strategy_type,
                asset_id,
                cold_storage_custodian_id,
                address,
                tag
            });

        })

    }));

    if(err) TE(err.message);

    return account;

};
module.exports.createColdStorageAccount = createColdStorageAccount;

const changeTransferStatus = async (transfer_id, status, user = null) => {

    if(!_.isNumber(transfer_id) || !_.isNumber(status)) TE('Must provide a valid transfer id and status');
    if(!Object.values(COLD_STORAGE_ORDER_STATUSES).includes(status)) TE(`Status "${status}" is not valid`);

    let [ err, transfer ] = await to(ColdStorageTransfer.findById(transfer_id));
    if(err) TE(err.message);
    if(!transfer) return null;

    //Check if the same status
    if(status === transfer.status) TE('Cannot set the same status twice.');

    //Check if the requested status can be set for the current state of transfer
    switch(status) {

        case COLD_STORAGE_ORDER_STATUSES.Approved:
            if(transfer.status !== COLD_STORAGE_ORDER_STATUSES.Pending) TE(`Only Pending transfer are allowed to be approved.`);
            break;

        default:
            TE(`Cannot set Status "${COLD_STORAGE_ORDER_STATUSES[status]}"`);
    }

    const original_transfer = transfer.toJSON();

    transfer.status = status;

    [ err, transfer ] = await to(transfer.save());

    const log_options = {
        previous_instance: original_transfer,
        updated_instance: transfer,
        replace: {
            status: {
                [COLD_STORAGE_ORDER_STATUSES.Pending]: `{cold_storage.transfers.status.${COLD_STORAGE_ORDER_STATUSES.Pending}}`,
                [COLD_STORAGE_ORDER_STATUSES.Approved]: `{cold_storage.transfers.status.${COLD_STORAGE_ORDER_STATUSES.Approved}}`,
                [COLD_STORAGE_ORDER_STATUSES.Sent]: `{cold_storage.transfers.status.${COLD_STORAGE_ORDER_STATUSES.Sent}}`,
                [COLD_STORAGE_ORDER_STATUSES.Completed]: `{cold_storage.transfers.status.${COLD_STORAGE_ORDER_STATUSES.Completed}}`,
                [COLD_STORAGE_ORDER_STATUSES.Failed]: `{cold_storage.transfers.status.${COLD_STORAGE_ORDER_STATUSES.Failed}}`,
            }
        }
    };

    if(user) await user.logAction('modified', log_options);
    else await logAction('modified', log_options);
    
    return transfer;

};
module.exports.changeTransferStatus = changeTransferStatus;
'use strict';

const { or, and, ne } = require('sequelize').Op;

const InvestmentRun = require('../models').InvestmentRun;
const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;
const ExchangeCredential = require('../models').ExchangeCredential;
const Instrument = require('../models').Instrument;
const InstrumentExchangeMapping = require('../models').InstrumentExchangeMapping;
const sequelize = require('../models').sequelize;

const { ISOLATION_LEVELS } = sequelize.Transaction;

const ccxtUtils = require('../utils/CCXTUtils');

const createExchangeAccount = async (account_type, asset_id, exchange_id, address, is_active = true) => {
    if (
        !account_type ||
        !asset_id ||
        !exchange_id ||
        !address ||
        (!_.isUndefined(is_active) && !_.isBoolean(is_active))
    ) TE('Creating an exchange account requires to specify an account type, asset id, exchange id and wallet address');

    const account_types = Object.values(MODEL_CONST.EXCHANGE_ACCOUNT_TYPES);

    if (!account_types.includes(account_type)) TE(`Invalid account type`);
    
    let [err, result] = await to(Promise.all([
        InstrumentExchangeMapping.count({
            where: { exchange_id },
            include: [{
                model: Instrument,
                required: true,
                where: {
                    [or]: [ { quote_asset_id: asset_id }, { transaction_asset_id: asset_id } ]
                }
            }]
        }),
        Exchange.count({
            where: { id: exchange_id }
        }),
        ExchangeAccount.count({
            where: {
                account_type, 
                asset_id, 
                exchange_id
            }
        })
    ]));

    if (err) TE(err.message);

    const [ found_asset, found_exchange, found_account ] = result;

    if (!found_exchange) TE(`Exchange not found with id ${exchange_id}`);
    if (!found_asset) TE(`Asset not found with id ${asset_id} or it is not available on the selected exchange`);
    if (found_account) TE(`Exchange account already exists with the specified parameters`);
    
    return sequelize.transaction({
        isolationLevel: ISOLATION_LEVELS.SERIALIZABLE
    }, async transaction => {

        const existing_account = await ExchangeAccount.findOne({
            where: { account_type, asset_id, exchange_id },
            transaction
        });

        if(existing_account) TE(`Exchange account already exists with the specified parameters`);

        return ExchangeAccount.create({
            account_type,
            asset_id,
            exchange_id,
            address,
            is_active
        }, { transaction });
    });

};
module.exports.createExchangeAccount = createExchangeAccount;

const editExchangeAccount = async (account_id, is_active) => {

    if(!_.isBoolean(is_active)) TE('\'is_active\' must be a valid boolean expression');

    let [ err, active_investment_run ] = await to(InvestmentRun.findOne({
        where: {
            [and]: [ 
                { status: { [ne]: INVESTMENT_RUN_STATUSES.Initiated } },
                { status: { [ne]: INVESTMENT_RUN_STATUSES.OrdersFilled } }
            ],
            is_simulated: false
        }
    }));

    if(err) TE(err.message);
    if(active_investment_run) TE(`Cannot edit Exchange Account while there are active Investment Runs`);

    let exchange_acount;
    [ err, exchange_acount ] = await to(ExchangeAccount.findById(account_id));

    if(err) TE(err.message);
    if(!exchange_acount) return null;

    exchange_acount.is_active = is_active;

    return exchange_acount.save();

};
module.exports.editExchangeAccount = editExchangeAccount;

const setExchangeCredentials = async (exchange_id, credentials = {}) => {

    const api_key_string = credentials.api_key;
    const api_secret_string = credentials.api_secret;

    if(!_.isString(api_key_string) || !_.isString(api_secret_string)) TE('Exchange API key and secret must be valid values');

    let [ err, exchange ] = await to(Exchange.findById(exchange_id));

    if(err) TE(err.message);
    if(!exchange) return null;

    let connector;
    [ err, connector ] = await to(ccxtUtils.getConnector(exchange.api_id));

    if(err) TE(err.message);

    const exchange_fields = EXCHANGE_CREDENTIALS[exchange.api_id].map(cred => cred.field_name);
    let additional_params_string = _.pick(credentials, exchange_fields);
    delete additional_params_string.api_key;
    delete additional_params_string.api_secret;

    let credential;
    [ err, credential ] = await to(sequelize.transaction(async transaction => {

        await ExchangeCredential.destroy({
            where: { exchange_id },
            transaction
        });

        return ExchangeCredential.create({
            exchange_id,
            updated: true,
            api_key_string,
            api_secret_string,
            additional_params_string
        }, { transaction });

    }));

    if(err) TE(err.message);

    connector.apiKey = credential.api_key_string;
    connector.secret = credential.api_secret_string;

    _.assign(connector, credential.additional_params_string);
    
    return credential;

};
module.exports.setExchangeCredentials = setExchangeCredentials;

//Not using a view as the data is encrypted and must be decrypted first.
const getExchangeCredentials = async (exchange_id) => {

    const [ err, credentials ] = await to(ExchangeCredential.findAll({
        where: exchange_id ? { exchange_id } : {},
        include: Exchange
    }));

    if(err) TE(err.message);
    if(exchange_id && !credentials.length) return null;

    let exchange_credentials = credentials.map(c => {
        return {
            id: c.id,
            exchange_id: _.get(c, 'Exchange.id', null),
            exchange: _.get(c, 'Exchange.name', null),
            api_key: c.api_key_string
        };
    });

    let footer = [
        {
            name: 'exchange',
            value: credentials.length,
            template: 'exchange_credentials.footer.exchange',
            args: {
                exchange: credentials.length
            }
        }
    ];

    if(exchange_id) {
        exchange_credentials = exchange_credentials[0];
        footer = undefined;
    }

    return { exchange_credentials, footer };

};
module.exports.getExchangeCredentials = getExchangeCredentials;

const getExchangeCredentialFields = async exchange_id => {

    const [ err, exchange ] = await to(Exchange.findById(exchange_id));

    if(err) TE(err.message);
    if(!exchange) return null;

    return EXCHANGE_CREDENTIALS[exchange.api_id];

};
module.exports.getExchangeCredentialFields = getExchangeCredentialFields;
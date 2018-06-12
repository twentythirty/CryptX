const SettingService = require('../services/SettingService');

/* Default values, a backup if for some reason we don't get any from database */
DEFAULT_SETTINGS = {
    /* Maximum marketshare percentage for LCI. Total marketshare of coins
    in LCI index should not go over this value */
    MARKETCAP_LIMIT_PERCENT: 90,

    /* Maximum sizes of coins in indexes */
    INDEX_LCI_CAP: 20,
    INDEX_MCI_CAP: 50
};

SYSTEM_SETTINGS = Object.assign({}, DEFAULT_SETTINGS);

/** Is used to parse values depending on what their data type is defined by constant
 * in SETTING_DATA_TYPES variable
 */
const parseValue = function (value, type) {
    let parsedValue;
    switch (type) {
        case SETTING_DATA_TYPES.Integer:
            parsedValue = parseInt(value, 10);
            break;
        case SETTING_DATA_TYPES.Float: 
            parsedValue = parseFloat(value);
            break;
        case SETTING_DATA_TYPES.String:
            parsedValue = value;
            break;
        case SETTING_DATA_TYPES.Boolean:
            if (String(a) == "true")
                parsedValue = true;
            else
                parsedValue = false;
            break;
        default: 
            parsedValue = value;
    }

    return parsedValue;
};
module.exports.parseValue = parseValue;

/** Takes values from DB table Setting and defines them in global SYSTEM_SETTING variable.
 *  This function should be called after editing values of system settings.
 */
const refreshSettingValues = async () => {
    let settings = await SettingService.getAllSettings();

    if (settings.length)
        settings.map(setting => {
            SYSTEM_SETTINGS[setting.key] = this.parseValue(setting.value, setting.type);
        });
    else
        TE("Couldn't get settings values");
};
module.exports.refreshSettingValues = refreshSettingValues;

//KEYS for various exchanges
EXCHANGE_KEYS = {
    binance: {
        apiKey: process.env.BINANCE_APIKEY,
        secret: process.env.BINANCE_SECRETKEY
    },
    bitfinex: {
        apiKey: process.env.BITFINEX_APIKEY,
        secret: process.env.BITFINEX_SECRETKEY
    },
    bitstamp: {
        apiKey: process.env.BITSTAMP_APIKEY,
        secret: process.env.BITSTAMP_SECRETKEY,
        uid: process.env.BITSTAMP_UID
    },
    bittrex: {
        apiKey: process.env.BITTREX_APIKEY,
        secret: process.env.BITTREX_SECRETKEY
    },
    hitbtc2: {
        apiKey: process.env.HITBTC_APIKEY,
        secret: process.env.HITBTC_SECRETKEY
    },
    kraken: {
        apiKey: process.env.KRAKEN_APIKEY,
        secret: process.env.KRAKEN_SECRETKEY
    }
}
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
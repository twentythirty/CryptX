/**
 *  Default values, a backup if for some reason we don't get any from database 
 */
DEFAULT_SETTINGS = {
    /** 
     * Maximum marketshare percentage for LCI. Total marketshare of coins
     * in LCI index should not go over this value 
     */
    MARKETCAP_LIMIT_PERCENT: 90.0,

    /* Maximum sizes of coins in indexes */
    INDEX_LCI_CAP: 20,
    INDEX_MCI_CAP: 50,

    /** 
     * Base trade amounts in base currencies. These amounts are guidelines for
     * the trading volume a new execution order will tend towards
     * in cases when a recipe order specifies to trade more than this.
     * Actual values will be fuzzy by `TRADE_BASE_FUZZYNESS * 100` percent 
     * */
    BASE_BTC_TRADE: 0.005, BASE_ETH_TRADE: 0.5,

    /**
     * Amount of randomization to apply to a base value in either direction (-fuzzy; +fuzzy).
     * Uses 0 to 1 ranging, with 1 being 100%
     */
    TRADE_BASE_FUZYNESS: 0.15,
    /**
     * Max number of exexcution order fails tolerated.
     * When this threshold is reached by a specific execution order, 
     * it will no longer be placed on exchanges and marked as failed
     */
    EXEC_ORD_FAIL_TOLERANCE: 5,

    /**
     * Threshold which is used to make recipe runs fail if base asset
     * haven't updated too long. The value is in seconds.
     * Currently it is 900 seconds, or 15 minutes.
     */
    BASE_ASSET_PRICE_TTL_THRESHOLD: 900,
    /**
     * The amount of time (in seconds) that an instrument's market data needs to be valid
     * before BASE_ASSET_PRICE_TTL_THRESHOLD seconds are up so that the instrument is still elligible
     * to be approved in an order. Currently set to 150 seconds or 2.5 minutes.
     * 
     */
    MARKET_DATA_TTL_HANDICAP: 150
};
/**
 * Actual system-used active database settings values
 */
SYSTEM_SETTINGS = {};

LIQUIDITY_LEVELS = [
    { level: 1, from: 0, to: 1000 },
    { level: 2, from: 1000, to: 10000 },
    { level: 3, from: 10000, to: 100000 },
    { level: 4, from: 100000, to: 1000000 },
    { level: 5, from: 1000000, to: 10000000 },
    { level: 6, from: 10000000, to: 100000000 },
    { level: 7, from: 100000000, to: 1000000000 },
    { level: 8, from: 1000000000, to: 10000000000 },
    { level: 9, from: 10000000000 }
];

ASSET_PRICING_MIN_AGE = '30 days';

//KEYS for various exchanges
EXCHANGE_KEYS = {
    binance: {
        apiKey: process.env.BINANCE_APIKEY,
        secret: process.env.BINANCE_SECRETKEY
    },
    bitfinex: {
        apiKey: process.env.BITFINEX_APIKEY,
        secret: process.env.BITFINEX_SECRETKEY,
        nonce: function () { // for some reason it doesn't work witout this
            return this.microseconds();
        }
    },
    bitstamp: {
        apiKey: process.env.BITSTAMP_APIKEY,
        secret: process.env.BITSTAMP_SECRETKEY,
        uid: process.env.BITSTAMP_UID
    },
    huobipro: {
        apiKey: process.env.HUOBIPRO_APIKEY,
        secret: process.env.HUOBIPRO_SECRETKEY
    },
    hitbtc2: {
        apiKey: process.env.HITBTC_APIKEY,
        secret: process.env.HITBTC_SECRETKEY
    },
    kraken: {
        apiKey: process.env.KRAKEN_APIKEY,
        secret: process.env.KRAKEN_SECRETKEY
    },
    okex: {
        apiKey: process.env.OKEX_APIKEY,
        secret: process.env.OKEX_SECRETKEY,
        password: process.env.OKEX_TRADE_PASSWORD
    }
}

const _base_credentials = [
    {
        title: 'exchange_credentials.fields.api_key',
        field_name: 'api_key',
        type: 'string'
    },
    {
        title: 'exchange_credentials.fields.api_secret',
        field_name: 'api_secret',
        type: 'string'
    }
];

EXCHANGE_CREDENTIALS = {
    binance: _base_credentials,
    bitfinex: _base_credentials,
    bitstamp: _base_credentials.concat([
        {
            title: 'exchange_credentials.fields.uid',
            field_name: 'uid',
            type: 'string'
        }
    ]),
    huobipro: _base_credentials,
    hitbtc2: _base_credentials,
    kraken: _base_credentials,
    okex: _base_credentials.concat([
        {
            title: 'exchange_credentials.fields.password',
            field_name: 'password',
            type: 'string'
        },
        {
            title: 'exchange_credentials.fields.passphrase',
            field_name: 'passphrase',
            type: 'string'
        }
    ])
}
//Until we start using v3
OKEX_WITHDRAW_FEES = {
    BTC: 0.0005,
    LTC: 0.001,
    ETH: 0.01,
    ETC: 0.001,
    BCH: 0.0005
};
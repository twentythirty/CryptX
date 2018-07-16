/**
 *  Default values, a backup if for some reason we don't get any from database 
 */
DEFAULT_SETTINGS = {
    /* Maximum marketshare percentage for LCI. Total marketshare of coins
    in LCI index should not go over this value */
    MARKETCAP_LIMIT_PERCENT: 90.0,

    /* Maximum sizes of coins in indexes */
    INDEX_LCI_CAP: 20,
    INDEX_MCI_CAP: 50,

    /** Base trade amounts in base currencies. These amounts are guidelines for
     *  the trading volume a new execution order will tend towards
     * in cases when a recipe order specifies to trade more than this.
     * Actual values will be `TRADE_BASE_FUZZYNESS` fuzzy */
    BASE_BTC_TRADE: 0.005,
    BASE_ETH_TRADE: 0.5,

    /**
     * Amount of randomization to apply to a base value in either direction (-fuzzy; +fuzzy).
     * Uses 0 to 1 ranging, with 1 being 100%
     */
    TRADE_BASE_FUZYNESS: 0.15,
    /**
     * Max number of exexcution order fails tolerated.
     * When this threshold is reached by a specific execution order, it will no longer be placed on exchanges and marked as failed
     */
    EXEC_ORD_FAIL_TOLERANCE: 5
};
/**
 * Actual system-used active database settings values
 */
SYSTEM_SETTINGS = {};

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
    }
}
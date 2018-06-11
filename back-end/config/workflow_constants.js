/* Maximum marketshare percentage for LCI. Total marketshare of coins
in LCI index should not go over this value */
LCI_MARKETSHARE_PRC = 90;

/* Maximum sizes of coins in indexes */
INDEX_LCI_CAP = 20;
INDEX_MCI_CAP = 50;

/* Total number of coins that can be in indexes */
INDEX_CAP_TOTAL = INDEX_LCI_CAP + INDEX_MCI_CAP


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
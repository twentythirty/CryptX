const { BeforeAll, Before, AfterAll, After } = require('cucumber');
const app = require('../../../app');

const sinon = require('sinon');
const ccxtUtils = require('../../../utils/CCXTUtils');

const binance_base = require('./stubs/binance.json');
const bitfinex_base = require('./stubs/bitfinex.json');
const bitstamp_base = require('./stubs/bitstamp.json');
const bittrex_base = require('./stubs/bittrex.json');
const hitbtc2_base = require('./stubs/hitbtc2.json');
const huobipro_base = require('./stubs/huobipro.json');
const kraken_base = require('./stubs/kraken.json');

const exchanges = {
    binance: binance_base,
    bitfinex: bitfinex_base,
    bitstamp: bitstamp_base,
    bittrex: bittrex_base,
    hitbtc2: hitbtc2_base,
    huobipro: huobipro_base,
    kraken: kraken_base
};

const { setWorldConstructor } = require('cucumber');

function CustomWorld() {
    this.worldLog = function(message) {    //Just an expiremntal exmaple
        console.log(`\x1b[5m\x1b[42m[WORLD]\x1b[0m: ${message}`);
    }

    this.app = app;

    this.defaultCredentials = {
        username: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PWD
    }
}

BeforeAll({ timeout: 15000000 }, async function(){

    const { Exchange } = require('../../../models');

    sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {
        let api_id = id;
        if(_.isNumber(id)) {
            const exchange = await Exchange.findById(id);

            api_id = exchange.api_id;
        }
        return Promise.resolve(exchanges[api_id]);
    });

    return app.dbPromise.then(() => {
        setWorldConstructor(CustomWorld);
    });
    
});

AfterAll(function() {
    
    [
        ccxtUtils.getConnector
    ].map(method => {
        if(method.restore) method.restore();
    });

});

After(function (scenario) {
    const status = scenario.result.status === 'passed' ? `\x1b[1m\x1b[32m${scenario.result.status}\x1b[0m` : `\x1b[1m\x1b[31m${scenario.result.status}\x1b[0m`;
    let duration = scenario.result.duration;

    if(duration < 200) duration = `\x1b[2m\x1b[32m(${duration}ms)\x1b[0m`;
    else if (duration < 500) duration = `\x1b[2m\x1b[33m(${duration}ms)\x1b[0m`;
    else duration = `\x1b[2m\x1b[31m(${duration}ms)\x1b[0m`;

    console.log(`\t${status}: \x1b[2m${scenario.pickle.name}\x1b[0m ${duration}`);

    for(let step of scenario.pickle.steps) {
        console.log(`\t    \x1b[1m\x1b[34m>  \x1b[0m\x1b[2m${step.text}\x1b[0m`);
    }
});

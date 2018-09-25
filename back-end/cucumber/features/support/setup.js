const { BeforeAll, Before, AfterAll, After, setDefaultTimeout } = require('cucumber');
const app = require('../../../app');

const sinon = require('sinon');
const ccxtUtils = require('../../../utils/CCXTUtils');
const fake_ccxt_methods = require('./stubs/ccxt_methods');

const exchanges = require('./stubs/exchanges');
setDefaultTimeout(20000);

const { setWorldConstructor } = require('cucumber');

const World = require('./global_world');

function CustomWorld() {
    this.worldLog = function(message) {    //Just an expiremntal exmaple
        console.log(`\x1b[5m\x1b[42m[WORLD]\x1b[0m: ${message}`);
    }

    this.app = app;

    this.defaultCredentials = {
        username: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PWD
    }

    attachServices(this)
}

function attachServices(world) {

    world.invitationService = require('../../../services/InvitationService');
}

Before(function(scenario) {
    World._current_scenario = scenario;
});

BeforeAll({ timeout: 15000000 }, async function(){

    const { Exchange } = require('../../../models');

    sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {
        
        let api_id = id;
        if(_.isNumber(id)) {
            const exchange = await Exchange.findById(id);

            api_id = exchange.api_id;
        }

        const exchange = exchanges[api_id];
        if(!exchange._init) {
            Object.assign(exchange, fake_ccxt_methods);
            exchange._init();
        }   
 
        return Promise.resolve(exchange);
    });

    sinon.stub(ccxtUtils, 'getThrottle').callsFake(async id => {
        
        let api_id = id;
        if(_.isNumber(id)) {
            const exchange = await Exchange.findById(id);

            api_id = exchange.api_id;
        }

        const exchange = exchanges[api_id];
        if(!exchange._init) {
            Object.assign(exchange, fake_ccxt_methods);
            exchange._init();
        }
        
        exchange.throttled = async function(default_return, fn, ...args) {

            const bound_fn = fn.bind(exchange);

            return bound_fn(...args);

        };
 
        return Promise.resolve(exchange);
    });

    return app.dbPromise.then(() => {
        setWorldConstructor(CustomWorld);
    });
    
});

AfterAll(function() {
    
    [
        ccxtUtils.getConnector,
        ccxtUtils.getThrottle
    ].map(method => {
        if(method.restore) method.restore();
    });

    if(World._logs.length) {
        console.log('\n');
        console.log('\x1b[1m\x1b[35m====================================\x1b[0mPRINT OUT\x1b[1m\x1b[35m====================================\x1b[0m');
        console.log('\n');
        for(let log of World._logs) {
            if(log.scenario.pickle) console.log(`\x1b[1m\x1b[32mScenario:\x1b[0m ${log.scenario.pickle.name}:\n`);
            console.log(log.message, ...log.args);
            console.log('\n');
        }
        console.log('\n');
        console.log('\x1b[1m\x1b[35m====================================\x1b[0mPRINT OUT\x1b[1m\x1b[35m====================================\x1b[0m');
    }

});

After(async function (scenario) {

    const status = scenario.result.status === 'passed' ? `\x1b[1m\x1b[32m${scenario.result.status}\x1b[0m` : `\x1b[1m\x1b[31m${scenario.result.status}\x1b[0m`;
    let duration = scenario.result.duration;

    if(duration < 200) duration = `\x1b[2m\x1b[32m(${duration}ms)\x1b[0m`;
    else if (duration < 500) duration = `\x1b[2m\x1b[33m(${duration}ms)\x1b[0m`;
    else duration = `\x1b[2m\x1b[31m(${duration}ms)\x1b[0m`;

    console.log(`\t${status}: \x1b[2m${scenario.pickle.name}\x1b[0m ${duration}`);

    for(let step of scenario.pickle.steps) {
        console.log(`\t    \x1b[1m\x1b[34m>  \x1b[0m\x1b[2m${step.text}\x1b[0m`);
    }

    //delete investment run if present
    if (this.current_investment_run != null
        && _.isFunction(this.current_investment_run.destroy)) {
        await this.current_investment_run.destroy();
    }
    //remove created execution orders
    if (this.current_execution_orders && 
        _.isArray(this.current_execution_orders)) {
            await require('../../../models').ExecutionOrder.destroy({
                where: {
                    id: _.map(this.current_execution_orders, 'id')
                }
            });
        }
});

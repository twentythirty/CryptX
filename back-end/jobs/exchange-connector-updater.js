/**
 * Currently the background job does not communicate with the app process,
 * thus, if someone changes the API key, it won't be updated the background job process.
 * This job will check for updated credentials in the database and update the connectors.
 */

 const ccxtUtils = require('../utils/CCXTUtils');

//Every 10 seconds
module.exports.SCHEDULE = "*/10 * * * * *";
module.exports.NAME = "EXCHANGE_CONNECTOR_UPDATER";
module.exports.JOB_BODY = async (config, log) => {

    const { models } = config;
    const { Exchange, ExchangeCredential } = models;

    log('1. Checking for updates in credentials...');
    let [ err, credentials ] = await to(ExchangeCredential.findAll({
        where: { updated: true },
        include: Exchange
    }));

    if(err) return log(`[ERROR.1A] Error occured while fetching the credentials from the database: ${err.message}`);
    if(!credentials.length) return log('[WARN.1A] No updates, stopping here...');

    log(`2. Updating ${credentials.length} credentials`);
    await Promise.all(credentials.map(async credential => {

        let connector;
        [ err, connector ] = await to(ccxtUtils.getConnector(credential.Exchange.api_id));

        if(err) return log(`[ERROR.2A](${credential.Exchange.name}) Error occured during connection fetching: ${err.message}`);

        log(`3.(${credential.Exchange.name}) Updating credentials...`);

        connector.apiKey = credential.api_key_string;
        connector.secret = credential.api_secret_string;
        
        _.assign(connector, credential.additional_params_object);

        credential.updated = false;

        [ err ] = await to(credential.save());

        if(err) return log(`[ERROR.3A](${credential.Exchange.name}) Error occured credential updated save: ${err.message}`);

    }));

};
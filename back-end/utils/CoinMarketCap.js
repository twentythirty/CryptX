const request = require('request-promise');

module.exports.get = (endpoint, options = {}) => {

    return _request('get', endpoint, options);

};

module.exports.post = (endpoint, body, options = {}) => {

    options.body = body;

    return _request('post', endpoint, options);

};

function _request(method, endpoint, options = {}) {

    return request[method]({
        uri: process.env.COINMARKETCAP_API_URL + endpoint,
        headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
        },
        json: true,
        gzip: true,
        ...options
    });

}
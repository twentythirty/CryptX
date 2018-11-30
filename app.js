const express = require('express');
const compression = require('compression')
const backend = require('./back-end/app.js');
const enforce = require('express-sslify');

const app = express();
app.use(enforce.HTTPS({
    trustXForwardedHostHeader: true,
    trustProtoHeader: true
}));

app.use(compression()); // enables gzip to compress files

// serve front-end files
app.use(express.static('front-end/dist'));

// serve backend api on /api route
app.use('/api', backend);

module.exports = app;
module.exports.dbPromise = app.dbPromise;
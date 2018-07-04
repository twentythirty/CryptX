const express = require('express');
const backend = require('./back-end/app.js');

const app = express();

// serve front-end files
app.use(express.static('front-end/dist'));

// serve backend api on /api route
app.use('/api', backend);

module.exports = app;
module.exports.dbPromise = app.dbPromise;
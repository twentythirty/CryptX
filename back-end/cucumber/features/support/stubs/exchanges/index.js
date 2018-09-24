const fs = require('fs');
var path = require('path');

const exchanges = {};

fs.readdirSync(__dirname).filter(file => {
    return (file !== path.basename(__filename) && file.slice(-5) === '.json')
}).forEach(file => {
    exchanges[file.replace('.json', '')] = require(`./${file}`);
});

module.exports = exchanges;

module.exports.nullOrNumber = value => {
    if(value === null) return true;
    else if(!isNaN(parseFloat(value))) return true;
    else return false;
}

module.exports.successResponse = value => {
    return (value >= 200 && value <= 299)
};

module.exports.failureResponse = value => {
    return (value >= 300 && value <= 600)
};

module.exports.greaterThanOrEqual = match => {
    return value => (value >= match);
};

module.exports.lessThanOrEqual = match => {
    return value => (value <= match);
};
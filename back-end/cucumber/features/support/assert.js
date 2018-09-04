module.exports.nullOrNumber = value => {
    if(value === null) return true;
    else if(!isNaN(parseFloat(value))) return true;
    else return false;
}
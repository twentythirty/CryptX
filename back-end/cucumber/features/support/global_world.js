module.exports = {
    _current_scenario: {},
    _logs: [],
    print: function(message, ...args) {
        if(_.isObject(message)) message = JSON.stringify(message, null, 4);
        this._logs.push({ message, args, scenario: this._current_scenario });
    }
};
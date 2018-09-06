module.exports = {
    _current_scenario: {},
    _logs: [],
    print: function(message, ...args) {
        this._logs.push({ message, args, scenario: this._current_scenario });
    }
};
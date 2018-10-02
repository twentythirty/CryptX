module.exports = {
    _current_scenario: {},
    _logs: [],
    print: function(message, ...args) {
        if(_.isObject(message)) message = JSON.stringify(message, null, 4);
        this._logs.push({ message, args, scenario: this._current_scenario });
    },
    parseStatuses: function(status_string, map, translation_key = null){
        return status_string
            .split(/,|and|or/)
            .map(status => {
                if(translation_key) return `${translation_key}.${map[status.trim()]}`
                else return map[status.trim()]
            })
            .filter(status => status);
    }
};
module.exports = {
    _current_scenario: {},
    _logs: [],
    _default_settings: {},
    print: function(message, ...args) {
        if(_.isObject(message)) message = JSON.stringify(message, null, 4);
        this._logs.push({ message, args, scenario: this._current_scenario });
    },
    printDataTable: function(data, options = {}) {
        if(!_.isArray(data)) data = [data];
        const attributes = options.attributes || Object.keys(data[0]);
        
        let table = '| ';
        for(let header of attributes) table += `${header}\t| `;
        table += '\n';
        
        for(let row of data) {
            table += '| ';
            for(let field of attributes) {
                if(!isNaN(row[field]) && !_.isNull(row[field]) && !_.isDate(row[field]) && !row[field] !== ''){
                    row[field] = Decimal(row[field]).toDP(9).toString();
                }
                table += `${row[field]}\t| `;
            }
            table += '\n';
        }

        this.print(table);

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
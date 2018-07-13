'use_strict';

let chai = require("chai");
let should = chai.should();
const filter_transformers = require('./../../utils/QueryFilterUtil');
const Op = require('../../models').Sequelize.Op;

describe('QueryFilterUtil', () => {

    it(' shall export 2 filtering functions', () => {
        chai.expect(filter_transformers.toWhereSQL).to.be.a('function');
        chai.expect(filter_transformers.toSequelizeWhere).to.be.a('function')
    });

    it(' toSequelizeWhere shall return an empty object for all invalid inputs', () => {

        const bad_params = {
            params_empty: filter_transformers.toSequelizeWhere(),
            params_null: filter_transformers.toSequelizeWhere(null),
            params_undefined: filter_transformers.toSequelizeWhere(undefined),
            params_empty_arr: filter_transformers.toSequelizeWhere([]),
            params_empty_obj: filter_transformers.toSequelizeWhere({})
        };

        _.forEach(bad_params, (output, key) => {

            chai.expect(output).to.be.empty;
        });
    });

    it(' toWhereSQL shall return an empty string for all invalid inputs', () => {

        const bad_params = {
            params_empty: filter_transformers.toWhereSQL(),
            params_null: filter_transformers.toWhereSQL(null),
            params_undefined: filter_transformers.toWhereSQL(undefined),
            params_empty_arr: filter_transformers.toWhereSQL([]),
            params_empty_obj: filter_transformers.toWhereSQL({})
        };

        _.forEach(bad_params, (output, key) => {

            chai.expect(output).to.eq('', `was supposed to return empty string for ${key}`);
        });
    });

    it(' toSequelizeWhere shall return simple Sequelize-able where object from simple keys', () => {
        const filter_props = {
            prop1: "Smith",
            prop2: 45,
            prop3: [77, -9],
            prop4: false
        };
        const where = filter_transformers.toSequelizeWhere(filter_props);

        chai.expect(where).to.deep.eq(filter_props);
    })

    it(' toWhereSQL shall return simple joined AND SQL when passed object with simple keys', () => {
        const filter_props = {
            prop1: "Smith",
            prop2: 45,
            prop3: [77, -9],
            prop4: false
        };
        const where = filter_transformers.toWhereSQL(filter_props);

        chai.expect(where).to.eq(
            '(prop1 = \'Smith\') AND (prop2 = 45) AND (prop3 IN (77, -9)) AND (prop4 = false)'
        );
    })

    it(' toSequelizeWhere shall create Sequelize-able contructions from keywords', () => {

        const filter_props = {
            and: [{
                    field: "prop1",
                    value: true
                },
                {
                    field: "prop2",
                    value: false
                }
            ],
            or: [{
                    field: "prop3",
                    value: [56, 57, 90]
                },
                {
                    field: "prop3",
                    value: [44, 90],
                    expression: "notIn"
                }
            ],
            not: [
                {
                    field: "prop5",
                    value: -99
                },
                {
                    field: "prop5",
                    value: -88
                }
            ],
            prop4: {
                value: "Smith",
                expression: "like"
            }
        };

        const where = filter_transformers.toSequelizeWhere(filter_props);

        chai.expect(where).to.deep.eq({
            prop4: {
                [Op.like]: "Smith"
            },
            [Op.or]: [{ prop3: [56, 57, 90] },
                {
                    prop3: {
                        [Op.notIn]: [44, 90]
                    }
                }
            ],
            [Op.and]: [ { prop1: true }, { prop2: false } ],
            [Op.not]: [ { prop5: -99 }, { prop5: -88 } ]
        });
    });


    it(' toWhereSQL shall create a WHERE clause SQL contructions from various keywords', () => {

        const filter_props = {
            and: [{
                    field: "prop1",
                    value: true
                },
                {
                    field: "prop2",
                    value: false
                }
            ],
            or: [{
                    field: "prop3",
                    value: [56, 57, 90]
                },
                {
                    field: "prop3",
                    value: [44, 90],
                    expression: "notIn"
                }
            ],
            not: [
                {
                    field: "prop5",
                    value: -99
                },
                {
                    field: "prop5",
                    value: -88,
                    expression: "gt"
                }
            ],
            prop4: {
                value: "Smith",
                expression: "like"
            }
        };

        const where = filter_transformers.toWhereSQL(filter_props);

        chai.expect(where).to.eq(
            `((prop1 = true AND prop2 = false) AND (prop3 IN (56, 57, 90) OR prop3 NOT IN (44, 90)) AND (prop5 != -99 AND prop5 <= -88)) AND (prop4 like 'Smith')`
        );
    });

});
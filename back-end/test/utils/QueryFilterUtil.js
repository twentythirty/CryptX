'use_strict';

let chai = require("chai");
let should = chai.should();
const filter = require('./../../utils/QueryFilterUtil');
const Op = require('../../models').Sequelize.Op;

describe('QueryFilterUtil', () => {

    it(' shall export a filtering function', () => {
        chai.expect(filter).to.be.a('function');
    });

    it(' shall return an empty object for all invalid inputs', () => {

        const bad_params = {
            params_empty: filter(),
            params_null: filter(null),
            params_undefined: filter(undefined),
            params_empty_arr: filter([]),
            params_empty_obj: filter({})
        };

        _.forEach(bad_params, (output, key) => {

            chai.expect(output).to.be.empty;
        });
    });

    it(' shall return simple Sequelize-able where object from simple keys', () => {
        const filter_props = {
            prop1: "Smith",
            prop2: 45,
            prop3: [77, -9],
            prop4: false
        };
        const where = filter(filter_props);

        chai.expect(where).to.deep.eq(filter_props);
    })

    it(' shall create Sequelize-able contructions from keywords', () => {

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

        const where = filter(filter_props);

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

});
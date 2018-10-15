"use strict";

const chai = require("chai");
const asPromised = require('chai-as-promised');
const { expect, assert } = chai;
const should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('LockUtils testing', () => {

    const { lock, unlock } = require('../../utils/LockUtils');

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const REJECT_ERROR = 'error_1';
    const RESOLVE_RESULT = 'all good';

    const MOCK_PROMISE = (will_fail = false, delay = 1000) => {

        return new Promise((resolve, reject) => {

            setTimeout(() => {

                if(will_fail) return reject(new Error(REJECT_ERROR));
                else return resolve(RESOLVE_RESULT);

            }, delay)

        });

    }

    const MOCK_ERROR = 'action locked';

    describe('and the method lock() shall', () => {

        it('exist', () => {

            expect(lock).to.be.not.undefined;

        });

        it('invalidate invalid arguments', async () => {

            const invalid_params = [
                [null, null, 'the first argument must be a method/function or a seperate method name must be provided in the options'],
                [{MOCK_PROMISE}, {}, 'the first argument must be a method/function or a seperate method name must be provided in the options'],
                [MOCK_PROMISE, 1, 'options must be an object'],
                [MOCK_PROMISE, { id: {} }, 'promise id must be provided as a string or number'],
                [MOCK_PROMISE, { id: 1, params: 123 }, 'passed params must be an array'],
                [MOCK_PROMISE, { id: 1, error_message: ['1'] }, 'error message cannot be an empty object/null'],
                [MOCK_PROMISE, { id: 2, error_message: 'error', lock_time: 'kek' }, 'lock time must be a valid number representing ms'],
                [MOCK_PROMISE, { id: 3, error_message: 'error', lock_time: 1000, keys: 'mn--W' }, 'keys must be a plain object']
            ];

            for(let params of invalid_params) {

                const [ error ] = await to(lock(...params));
                expect(error, `Expected the method lock() to reject params: ${JSON.stringify(params)}`).to.be.not.null;
                expect(error.message).to.equal(params[2]);

            }

        });

        it('throw an error of the provided method', async () => {

            const ID = Date.now();

            const [ error ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                params: [true, 0]
            }));

            expect(error, 'Expected to get an error').to.be.not.null;
            expect(error.message).to.equal(REJECT_ERROR);

        });

        it('return the resolved result of the provided promise', async () => {

            const ID = Date.now();

            const [ error, result ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                params: [false, 0]
            }));

            expect(error, 'Expected to not get an error').to.be.null;
            expect(result).to.equal(RESOLVE_RESULT);

        });

        it('create a keyless lock and prevent any access for that time', async () => {

            const ID = Date.now();

            lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 100]
            });
            
            const [ error ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 100]
            }));

            expect(error, 'I was suppose to get an error').to.be.not.null;
            expect(error.message).to.equal(MOCK_ERROR);

            await sleep(150);

            return assert.isFulfilled(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 100]
            }), 'Expected the method to be unocked by this time');

        });

        it('create a keyed lock and prevent any access for that time if the same keys are provided', async () => {

            const ID = Date.now();
            const KEYS_1 = { KEY: 1 };
            const KEYS_2 = { KEY: 2 };

            lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                keys: KEYS_1,
                params: [false, 100]
            });
            //Fails due to using the same keys
            const [ error ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                keys: KEYS_1,
                params: [false, 100]
            }));

            expect(error, 'I was suppose to get an error').to.be.not.null;
            expect(error.message).to.equal(MOCK_ERROR);
            //Using a different key should not fail
            await assert.isFulfilled(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                keys: KEYS_2,
                params: [false, 100]
            }), 'Expected the lock to be ignored when using a different set of keys');

            await sleep(150);
            //The old key should be unlocked
            return assert.isFulfilled(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                keys: KEYS_1,
                params: [false, 100]
            }), 'Expected the method to be unocked by this time');

        });

        it('create a lock which will unlock in 100 ms, even if the promise takes longer', async () => {

            const ID = Date.now();

            //Creating a lock with a promise that resolve in a minute, but it should unlock in 100ms
            lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                lock_time: 100,
                params: [false, 1000]
            });
            //still locked
            const [ error ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 100]
            }));

            expect(error, 'I was suppose to get an error').to.be.not.null;
            expect(error.message).to.equal(MOCK_ERROR);

            await sleep(150);
            //Method should be unlocked, even if the promise is still hanging
            return assert.isFulfilled(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 100]
            }), 'Expected the method to be unocked by this time');

        });

    });

    describe('and the method unlock() shall', () => {

        it('exist', () => {
            expect(unlock).to.be.not.undefined;
        });

        it('unlock a locked method', async () => {

            const ID = Date.now();

            //Creating a lock with a promise that resolve in a minute
            lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 1000]
            });
            //still locked
            const [ error ] = await to(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 0]
            }));

            expect(error, 'I was suppose to get an error').to.be.not.null;
            expect(error.message).to.equal(MOCK_ERROR);

            unlock(ID);

            return assert.isFulfilled(lock(MOCK_PROMISE, {
                id: ID,
                error_message: MOCK_ERROR,
                params: [false, 0]
            }), 'Expected the method to be unocked by the unlock() method');

        });

    });

});
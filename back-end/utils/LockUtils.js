const DEFAULT = {
    LOCK_TIME: 10000,
    MESSAGE: 'This action is locked',
    KEYS: {}
};

const locks = [];

/**
 * Creates a lock on promise. Method created that promises cannot be accessed until it
 * resolves or rejects, unless diffent keys are provided.
 * As a safety precaution, the locks automatically unlock after some time.
 * @param {Function|Object} method a methodto be lock. Can be an object of methods, if `this` important. Must proved `method` name in the options.
 * @param {Object} options lock options
 * @param {[String|Number|Object|Buffer]} [options.params=[]] optional array of params for the method. Must be in the same order as the function params.
 * @param {String|Number} options.id REQUIRED. identifier for the method.
 * @param {String} [options.error_message] optional error message which will be thrown if the method is still locked.
 * @param {Number} [options.lock_time=10000] ms after the lock unlocks, despite the result of the promise.
 * @param {Object|String|Number} [options.keys={}] optional object of keys. Providing different keys will ignore the current lock
 * @param {String} [options.method] optional method name if the first argument was an object of methods.
 * @param {Number} [options.max_block] CUCUMBER TESTS ONLY. Set the number of maximum attempts to block. Used to test the transaction layer if the lock fails
 */
const lock = async (method, options = {}) => {

    if(!_.isFunction(method) && !_.get(options, 'method')) throw new Error('the first argument must be a method/function or a seperate method name must be provided in the options');
    if(!_.isPlainObject(options)) throw new Error('options must be an object');

    const params = options.params || [];
    if(!_.isArray(params)) throw new Error('passed params must be an array');

    const id = options.id;
    if(!(_.isString(id) || _.isNumber(id))) throw new Error('promise id must be provided as a string or number');

    const error_message = options.error_message || DEFAULT.MESSAGE;
    if(!(_.isString(error_message) || _.isNumber(error_message))) throw new Error('error message cannot be an empty object/null');

    const lock_time = options.lock_time || DEFAULT.LOCK_TIME;
    if(!_.isNumber(lock_time)) throw new Error('lock time must be a valid number representing ms');

    const keys = options.keys || DEFAULT.KEYS;

    if(_isLocked(id, keys)) throw new Error(error_message);

    _addLock(id, keys, lock_time, options.max_block);

    const [ error, result ] = await to(options.method ? method[options.method](...params) : method(...params), false);

    unlock(id, keys);

    if(error) throw error;

    return result;

};

/**
 * Removes a lock from a method with the specified id and optional keys
 * @param {String|Number} id REQUIRED. method identifier
 * @param {Object} [keys={}] optional keys if the method was using them. 
 */
const unlock = (id, keys = {}) => {

    if(!id) throw new Error('method id must be provided');

    const existing_lock = locks.find(l => l.id === id && _.isEqual(l.keys, keys));
    
    if(existing_lock) {
        clearTimeout(existing_lock.timeout);
        const index = locks.indexOf(existing_lock);
        locks.splice(index, 1);
    }

};

const _isLocked = (id, keys = {}) => {

    const existing_lock = locks.find(l => l.id === id && _.isEqual(l.keys, keys));

    if(!existing_lock) return false;

    if(existing_lock.locked_until < Date.now()) {
        unlock(id, keys);
        return false;
    }

    /**
     * If this is a cucumber enviroment and a max block amount was set, it will bypass
     * the requests after blocking a certain number of requests, does not unlock the lock.
     */
    if(process.env.NODE_ENV === 'cucumber' && existing_lock.max_block) {
        if(existing_lock.attempts_blocked >= existing_lock.max_block) return false;
    }

    existing_lock.attempts_blocked++;

    return true;

}

const _addLock = (id, keys = {}, lock_time = 0 , max_block = null) => {

    const existing_lock = locks.find(l => l.id === id && _.isEqual(l.keys, keys));

    if(existing_lock) return;

    locks.push({
        id, keys,
        locked_until: Date.now() + lock_time,
        timeout: setTimeout(() => {
            unlock(id, keys);
        }, lock_time),
        attempts_blocked: 0,
        max_block
    });

};

module.exports = { lock, unlock };
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
 * @param {Promise} promise a promise of a method that needs to be locked.
 * @param {Object} options lock options
 * @param {String|Number} options.id REQUIRED. identifier for the method.
 * @param {String} [options.error_message] optional error message which will be thrown if the method is still locked.
 * @param {Number} [options.lock_time=10000] ms after the lock unlocks, despite the result of the promise.
 * @param {Object} [options.keys={}] optional object of keys. Providing different keys will ignore the current lock
 */
const lock = async (promise, options = {}) => {

    if(!(promise instanceof Promise)) throw new Error('the first argument must be a promise');
    if(!_.isPlainObject(options)) throw new Error('options must be an object');

    const id = options.id;
    if(!(_.isString(id) || _.isNumber(id))) throw new Error('promise id must be provided as a string or number');

    const error_message = options.error_message || DEFAULT.MESSAGE;
    if(!(_.isString(error_message) || _.isNumber(error_message))) throw new Error('error message cannot be an empty object/null');

    const lock_time = options.lock_time || DEFAULT.LOCK_TIME;
    if(!_.isNumber(lock_time)) throw new Error('lock time must be a valid number representing ms');

    const keys = options.keys || DEFAULT.KEYS;
    if(!_.isPlainObject(keys)) throw new Error('keys must be a plain object');

    if(_isLocked(id, keys)) throw new Error(error_message);

    _addLock(id, keys, lock_time);

    const [ error, result ] = await to(promise, false);

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
    if(!_.isPlainObject(keys)) throw new Error('keys must be a plain object');

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

    return true;

}

const _addLock = (id, keys = {}, lock_time = 0) => {

    locks.push({
        id, keys,
        locked_until: Date.now() + lock_time,
        timeout: setTimeout(() => {
            unlock(id, keys);
        }, lock_time)
    });

};

module.exports = { lock, unlock };
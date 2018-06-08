'use strict';

module.exports = class CryptXError extends Error {
    constructor(...args) {
      super(...args);
      Error.captureStackTrace(this, CryptXError);
    }
};
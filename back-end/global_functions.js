//custom error class
const CryptXError = require('./errors/CryptXError');
const util = require('util');

const IncomingMessage = require("http").IncomingMessage;

//allow the to mechanism to not parse the error it receives assuming the error is preparsed
to = function(promise, parse_error = true) {
  
  //global function that will help use handle promise rejections, this article talks about it http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => [
      parse_error? pe(err) : err
    ]);
};

pe = require("parse-error"); //parses error so you can read error message and handle them accordingly

TE = function(err_message, ...args) {
  // TE stands for Throw Error
  if (process.env.NODE_ENV == 'dev') {
    if (args.length)
      console.error(err_message, args);
    else
      console.error(err_message);
  }

  const formatted_error = args.length? util.format(err_message, args) : util.format(err_message);

  throw new CryptXError(formatted_error);
};

ReE = function(res, err, code) {
  // Error Web Response
  if (typeof err == "object" && typeof err.message != "undefined") {
    err = err.message;
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json({ success: false, error: err });
};

ReS = function(res, data, code) {
  // Success Web Response
  let send_data = { 
    success: true,
   };
   if (res.next_token != null) {
    send_data.next_token = res.next_token;
   }

  if (typeof data == "object") {
    send_data = Object.assign(data, send_data); //merge the objects
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);
};

//This is here to handle all the uncaught promise rejections
process.on("unhandledRejection", error => {
  console.error("Uncaught Error", pe(error));
});

//a standard object for defining CryptX models, underscores + no timestamps
modelProps = function(table_name, table_comment = "") {
  return {
    //use underscore parameter and key names
    underscored: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
    // define the table's name
    tableName: table_name,
    comment: table_comment
  };
};

// Load the dash, globally.
_ = require("lodash");
//globally load decimals
Decimal = require('decimal.js');

/**
 * Standard clamp function used to control value ranges.
 * If given a value that is smaller than min, will return min
 * If given a value larger than max, will return max
 * Otherwise will return value.
 * All parameters need to be numeric.
 */
clamp = (value, min = value, max = value) => {
  return Math.max(min, Math.min(value, max))
}

//adapted from https://stackoverflow.com/a/42304596
// settle all promises.  For rejeted promises, return a specific rejectVal that is
// distinguishable from your successful return values (often null or 0 or "" or {})
Promise.settle_all = (default_val, promises) => {
  //fulfill al promises but wrapped
  return Promise.all(promises.map(p => {
    //wrap actual promise in promise that returns default value if rejected and goes through
    return Promise.resolve(p).catch(err => {
      //return defaul on reject
      return default_val;
    });
  }));
}

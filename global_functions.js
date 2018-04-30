const IncomingMessage = require("http").IncomingMessage;

to = function(promise) {
  
  //global function that will help use handle promise rejections, this article talks about it http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => [pe(err)]);
};

pe = require("parse-error"); //parses error so you can read error message and handle them accordingly

//custom error class

class CryptXError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, CryptXError);
  }
}

TE = function(err_message, log = false) {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message);
  }

  throw new CryptXError(err_message);
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
  let send_data = { success: true };

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

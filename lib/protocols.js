var u_ = require("underscore"),
    util = require("util");

/**
 * Game server protocols.
 * 
 * @author tkisiel
 */
exports.protocols = {
    "json": {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
};

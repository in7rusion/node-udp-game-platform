var events = require("events"),
    u_ = require("underscore"),
    util = require("util");

/**
 * Game engine.
 * 
 * @author tkisiel
 */
exports.GameEngine = function(conf) {
    var self = this;
    var Phase = { CREATED: 0, STARTED: 1, ENDED: 2 };
    var phase = Phase.CREATED;
    self.status = function() {
        return {
            phase: phase,
        };
    };
};
exports.GameEngine.prototype = events.EventEmitter.prototype;

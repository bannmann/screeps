var _ = require("lodash");
var logger = require("logger");

module.exports.apply = function() {
    Creep.prototype._log = function(message) {
        logger.log(this.name + ": " + message);
    }

    Creep.prototype.logDebug = function(message) {
        if (("debug-" + this.name) in Game.flags || ("debug-" + this.room.name) in Game.flags) {
            this._log(message);
        }
    }

    Creep.prototype.logInfo = function(message) {
        this._log(message);
    }
};
require('util_profiler').registerModule(module);
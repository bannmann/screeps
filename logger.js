var lastTick = 0;
var messageNumber = 0;

var errors = {};
function register(constantName) {
    errors[global[constantName]] = constantName;
}
register("ERR_NOT_OWNER");
register("ERR_NO_PATH");
register("ERR_NAME_EXISTS");
register("ERR_BUSY");
register("ERR_NOT_FOUND");
register("ERR_NOT_ENOUGH_ENERGY");
register("ERR_NOT_ENOUGH_RESOURCES");
register("ERR_INVALID_TARGET");
register("ERR_FULL");
register("ERR_NOT_IN_RANGE");
register("ERR_INVALID_ARGS");
register("ERR_TIRED");
register("ERR_NO_BODYPART");
register("ERR_NOT_ENOUGH_EXTENSIONS");
register("ERR_RCL_NOT_ENOUGH");
register("ERR_GCL_NOT_ENOUGH");

module.exports = {
    log: function(message) {
        if (lastTick != Game.time) {
            messageNumber = 0;
        }

        console.log(Game.time + ":" + messageNumber + " " + message)

        messageNumber++;
        lastTick = Game.time;
    },

    notify: function(message) {
        Game.notify(message);
        this.log(message);
    },

    notifyError: function(message, errorCode) {
        var cause;
        if (errorCode in errors) {
            cause = "error " + errors[errorCode];
        } else {
            cause = "unknown error (" + errorCode + ")";
        }
        this.notify(message + ", " + cause);
    }
}
require('util_profiler').registerModule(module);
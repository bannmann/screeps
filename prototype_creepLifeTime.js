var _ = require("lodash");

module.exports.apply = function() {
    if (!Creep.prototype.hasOwnProperty("tickLifeTime")) {
        Object.defineProperty(
            Creep.prototype, "tickLifeTime", {
                get: function() {
                    var result = CREEP_LIFE_TIME;
                    if (this.hasActiveBodyparts(CLAIM)) {
                        result = CREEP_CLAIM_LIFE_TIME;
                    }
                    return result;
                }
            });
    }

    if (!Creep.prototype.hasOwnProperty("ticksLived")) {
        Object.defineProperty(
            Creep.prototype, "ticksLived", {
                get: function() {
                    if (this.spawning) {
                        return undefined;
                    } else if (!this.ticksToLive) {
                        // In the first tick after spawning completes, ticksToLive is undefined.
                        return 0;
                    } else {
                        return this.tickLifeTime - this.ticksToLive;
                    }
                }
            });
    }
};
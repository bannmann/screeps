// Younger creeps are considered not representative and ignored by getCounterAverage().
const MINIMUM_TICKS_LIVED = 50;

var logger = require("logger");
var Objects = require("util_objects");

module.exports = {
    incrementCounter: function(creep, counterName) {
        var value = this.loadCounter(creep, counterName);
        this.saveCounter(creep, counterName, ++value);
    },

    loadCounter: function(creep, counterName) {
        var value = Objects.loadPath(creep.memory, ["stats"], counterName) || 0;
        return value;
    },

    saveCounter: function(creep, counterName, value) {
        Objects.savePath(creep.memory, ["stats"], counterName, value);
    },

    /**
     * Gets the average tick value of all matching creeps, relative to their age, as a value between 0 and 1.
     */
    getRelativeTickCount: function(room, counterName, findOptions) {
        var sum = 0;
        var creeps = 0;
        _.each(room.find(FIND_MY_CREEPS, findOptions), (creep) => {
            if (creep.ticksLived >= MINIMUM_TICKS_LIVED) {
                var absolute = this.loadCounter(creep, counterName);
                var base = creep.ticksLived;
                var relative = absolute / base;
                sum += relative;
                creeps++;
            }
        });
        if (creeps) {
            return sum / creeps;
        } else {
            return undefined;
        }
    }
};
require('util_profiler').registerModule(module);
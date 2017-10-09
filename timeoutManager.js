var Objects = require("util_objects");

module.exports = {
    start: function() {
    },
    stop: function() {
        var lastFinishedTick = Objects.loadPath(Memory, ["TimeoutManager"], "lastTick");
        if (lastFinishedTick) {
            for (var i = lastFinishedTick + 1; i < Game.time; i++) {
                Objects.savePath(Memory, ["TimeoutManager", "lostTicks"], "" + i, true);
            }
        }
        Objects.savePath(Memory, ["TimeoutManager"], "lastTick", Game.time);
    }
};
require('util_profiler').registerModule(module);
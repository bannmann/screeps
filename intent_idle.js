const ACCEPTABLE_ADJACENT_OBSTACLES = 1;

var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var creepStats = require("creepStats");

module.exports = {
    name: "idle",
    range: 0,
    canBePerformedBy: function(creep) {
        return true;
    },
    listPossibilities: function(creep) {
        var result = [];

        result.push(new Possibility({
            creep: creep,
            intent: this,
            baseImportance: 0
        }));

        return result;
    },
    pursue: function(creep) {
        creepStats.incrementCounter(creep, "idleTicks");

        this.sidestepIfNeeded(creep);

        intentsUtil.reset(creep);
        this.showIndicator(creep);
    },
    sidestepIfNeeded: function(creep) {
        if (this.isBlocking(creep)) {
            this.performSidestep(creep);
        }
    },
    isBlocking: function(creep) {
        var result = false;
        var adjacentObstacles = 0;
        for (var direction = 1; direction <= 8; direction++) {
            var pos = creep.pos.applyDirection(direction);
            if (pos instanceof RoomPosition && pos.hasObstacle()) {
                adjacentObstacles++;
                if (adjacentObstacles > ACCEPTABLE_ADJACENT_OBSTACLES) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    },
    performSidestep: function(creep) {
        var direction = this.findFreeDirection(creep);
        if (direction) {
            creep.move(direction);
        }
    },
    /**
     * @return Screeps directions from TOP = 1 to TOP_LEFT = 8, or undefined
     */
    findFreeDirection: function(creep) {
        var offset = this.randomInt(0, 7);
        var result;
        for (var i = 0; i < 8; i++) {
            // Screeps direction constants are one-indexed, hence the +1 after the modulo.
            var direction = (i + offset) % 8 + 1;
            if (this.isDirectionFree(creep, direction)) {
                result = direction;
            }
        }
        return result;
    },
    isDirectionFree: function(creep, direction) {
        var adjacentPos = creep.pos.applyDirection(direction);
        return adjacentPos instanceof RoomPosition && !adjacentPos.hasObstacle();
    },
    /**
     * @param min minimum integer, inclusive
     * @param max maximum integer, inclusive
     */
    randomInt: function(min, max) {
        // from http://stackoverflow.com/a/1527820/7641
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    showIndicator: function(creep) {
        creep.room.visual.circle(
            creep.pos.x,
            creep.pos.y,
            {
                radius: 0.33,
                fill: "lime",
                opacity: 1
            });
        creep.room.visual.text("\u258c\u258c", creep.pos.x + 0.05, creep.pos.y + 0.1, { color: "black", size: 0.3 });
    }
};
require('util_profiler').registerModule(module);
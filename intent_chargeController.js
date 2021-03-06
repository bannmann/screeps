const TICKS_TO_DOWNGRADE_THRESHOLD = 500;

var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "chargeController",
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        _.each(Game.structures, (structure) => {
            if (structure.structureType == STRUCTURE_CONTROLLER && structure.room == creep.room) {
                // Increase panic level as ticksToDowngrade approaches threshold, but never surpass 1
                var panicLevel = TICKS_TO_DOWNGRADE_THRESHOLD / Math.max(structure.ticksToDowngrade, TICKS_TO_DOWNGRADE_THRESHOLD);

                // Usually, this intent is unimportant, but when it panics, it's very, very important
                var importance = 0.1 + panicLevel * 0.85;

                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: structure,
                    shortDistanceFactor: 0.1,
                    baseImportance: importance,
                    preparationFunction: function() {
                        creep.memory.target = this.roomObject.id;
                    }
                }));
            }
        });
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == 0) {
            intentsUtil.abort(creep, this, "no energy");
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            var upgradeResult = creep.upgradeController(target);
            if (upgradeResult != OK) {
                intentsUtil.abort(creep, this, upgradeResult);
            }
        }
    }
};
require('util_profiler').registerModule(module);
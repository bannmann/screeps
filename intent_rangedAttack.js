var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var enemyDirectory = require("enemyDirectory");

module.exports = {
    name: "rangedAttack",
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, RANGED_ATTACK);
    },
    listPossibilities: function(creep) {
        var result = [];

        _.each(creep.room.find(FIND_HOSTILE_CREEPS),
            (candidate) => {
                if (enemyDirectory.shouldAttack(candidate)) {
                    var wounded = (candidate.hitsMax - candidate.hits) / candidate.hitsMax;
                    result.push(
                        new Possibility(
                            {
                                creep: creep,
                                intent: this,
                                roomObject: candidate,
                                shortDistanceFactor: 0.025,
                                baseImportance: 0.7 + candidate.canHeal * 0.1 + wounded * 0.05,
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
        if (!target) {
            intentsUtil.reset(creep);
        }
        else {
            var attackResult = creep.rangedAttack(target);
            if (attackResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (attackResult != OK) {
                intentsUtil.abort(creep, this, "attackResult " + attackResult);
            }
        }
    }
};
require('util_profiler').registerModule(module);
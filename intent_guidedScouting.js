var logger = require("logger");
var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "guidedScouting",
    range: 0,
    canBePerformedBy: function(creep) {
        return creep.memory.race == "scout" && creep.hasActiveBodyparts(MOVE);
    },
    listPossibilities: function(creep) {
        var result = [];

        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("scout") && !flag.pos.isEqualTo(creep.pos)) {
                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: flag,
                        shortDistanceFactor: 0.1,
                        baseImportance: 0.5
                    }));
                }
            });

        return result;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            logger.notify("Scout " + creep.name + " reached " + creep.pos + " at age " + creep.ticksLived);
            intentsUtil.reset(creep);
        }
    }
};
require('util_profiler').registerModule(module);
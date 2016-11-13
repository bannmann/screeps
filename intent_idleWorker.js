var spawnManager = require("spawnManager");
var intentsUtil = require("util_intents");

module.exports = {
    canBePerformedBy: function(creep) {
        return creep.memory.race == "worker";
    },
    listPossibilities: function(creep) {
        var result = [];
        result.push(
            {
                importance: 0,
                choose: function() {
                    creep.memory.intent = "idleWorker";
                }
            });
        return result;
    },
    pursue: function(creep) {
        creep.say("Zzzzzz....");
        spawnManager.registerIdleCreep();
        intentsUtil.reset(creep);
    }
};
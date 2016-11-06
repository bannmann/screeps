var spawnManager = require("spawnManager");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "idleWorker",
    range: 0,
    canBePerformedBy: function(creep) {
        return creep.memory.race == "worker";
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
        creep.say("Zzzzzz....");
        spawnManager.registerIdleCreep();
        intentsUtil.reset(creep);
    }
};
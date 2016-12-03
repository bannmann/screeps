var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var workerRace = require("race_worker");

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
        workerRace.registerIdleCreep(creep);
        intentsUtil.reset(creep);
    }
};
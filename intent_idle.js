var spawnManager = require("spawnManager");

module.exports = {
    canBePerformedBy: function(creep) {
        return true;
    },
    listPossibilities: function(creep) {
        var result = [];
        result.push(
            {
                importance: Number.MIN_VALUE,
                choose: function() {
                    creep.memory.intent = "idle";
                }
            });
        return result;
    },
    pursue: function(creep) {
        creep.say("Zzzzzz....");
        spawnManager.registerIdleCreep();
        delete creep.memory.intent;
    }
};
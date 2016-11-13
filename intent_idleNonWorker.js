var intentsUtil = require("util_intents");
var idleWorkerIntent = require("intent_idleWorker");

module.exports = {
    canBePerformedBy: function(creep) {
        return !idleWorkerIntent.canBePerformedBy(creep);
    },
    listPossibilities: function(creep) {
        var result = [];
        result.push(
            {
                importance: 0,
                choose: function() {
                    creep.memory.intent = "idleNonWorker";
                }
            });
        return result;
    },
    pursue: function(creep) {
        intentsUtil.reset(creep);
    }
};
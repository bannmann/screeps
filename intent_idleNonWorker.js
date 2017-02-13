var intentsUtil = require("util_intents");
var idleWorkerIntent = require("intent_idleWorker");
var Possibility = require("possibility");

module.exports = {
    name: "idleNonWorker",
    range: 0,
    canBePerformedBy: function(creep) {
        return !idleWorkerIntent.canBePerformedBy(creep);
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
        intentsUtil.reset(creep);
        idleWorkerIntent.showIndicator(creep);
    }
};
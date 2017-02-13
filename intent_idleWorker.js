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
        workerRace.registerIdleCreep(creep);
        intentsUtil.reset(creep);
        this.showIndicator(creep);
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
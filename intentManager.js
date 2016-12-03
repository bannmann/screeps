var intents = require("intents");
var intentsUtil = require("util_intents");

module.exports.processIntents = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        creep.logDebug("inspected by intentManager " + JSON.stringify(creep.pos));

        if (!creep.spawning) {
            if (!creep.memory.intent) {
                creep.logDebug("needs intent");
                var possibilities = [];
                for (var intentName in intents) {
                    var intent = intents[intentName];
                    if (intent.canBePerformedBy(creep)) {
                        creep.logDebug(intentName + ":");
                        var intentPossibilities = intent.listPossibilities(creep);
                        _.each(
                            intentPossibilities, (p) => {
                                creep.logDebug("    " + JSON.stringify(p));
                            });
                        possibilities = possibilities.concat(intentPossibilities);
                    }
                }
                var possibility = null;
                possibilities.forEach(
                    (current) => {
                        if (current.importance < 0 || current.importance > 1) {
                            Game.notify(
                                "Illegal importance value of " + current.importance + " for possibility choice " +
                                JSON.stringify(current));
                            current.importance = 0;
                        }

                        if (!possibility || current.importance > possibility.importance) {
                            possibility = current;
                        }
                    });
                creep.logDebug("chosing " + JSON.stringify(possibility));
                possibility.choose();
            }

            creep.logDebug("detected " + creep.memory.intent);
            var intent = intents[creep.memory.intent];
            if (intent) {
                creep.logDebug("pursue " + intent.name);
                intent.pursue(creep);
            }
            else {
                intentsUtil.reset(creep);
            }
        }

        creep.logDebug("intentManager finish");
    }
};
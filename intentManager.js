var intents = require("intents");
var intentsUtil = require("util_intents");

module.exports.processIntents = function() {
    _.each(Game.creeps, (creep) => {
        creep.logDebug("inspected by intentManager " + JSON.stringify(creep.pos));

        if (!creep.spawning) {
            if (!creep.memory.intent) {
                creep.logDebug("needs intent");
                var possibilities = [];
                _.each(intents, (intent, intentName) => {
                    if (intentsUtil.isCreepSuitableForIntent(creep, intentName) && intent.canBePerformedBy(creep)) {
                        creep.logDebug(intentName + ":");
                        var intentPossibilities = intent.listPossibilities(creep);
                        _.each(
                            intentPossibilities, (p) => {
                                creep.logDebug("    " + JSON.stringify(p));
                            });
                        possibilities = possibilities.concat(intentPossibilities);
                    }
                });
                var possibility = null;
                _.each(possibilities,
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
                if (possibility) {
                    creep.logDebug("chosing " + JSON.stringify(possibility));
                    possibility.choose();
                } else {
                    Game.notify(
                        "found no suitable intent for creep " + creep.name + ", memory " +
                        JSON.stringify(creep.memory));
                }
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
    });
};
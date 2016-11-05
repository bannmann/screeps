var intents = require("intents");

module.exports.processIntents = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (!creep.spawning && !creep.memory.intent) {
            var possibilities = [];
            for (var intentName in intents) {
                var intent = intents[intentName];
                if (intent.canBePerformedBy(creep)) {
                    var intentPossibilities = intent.listPossibilities(creep);
                    possibilities = possibilities.concat(intentPossibilities);
                }
            }
            var possibility;
            possibilities.forEach(
                (current) => {
                    if (current.importance < 0 || current.importance > 1) {
                        Game.notify("Illegal importance value of " + current.importance + " for possibility choice " + current.choose);
                        current.importance = 0;
                    }

                    if (!possibility || current.importance > possibility.importance) {
                        possibility = current;
                    }
                });
            possibility.choose();
        }

        var intent = intents[creep.memory.intent];
        if (intent) {
            intent.pursue(creep);
        }
        else {
            delete creep.memory.intent;
        }
    }
};
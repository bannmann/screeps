var intents = require("intents");

module.exports.processIntents = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (!creep.spawning && !creep.memory.intent) {
            var possibilities = [];
            for (var intentName in intents) {
                var intent = intents[intentName];
                if (intent.canBePerformedBy(creep)) {
                    possibilities = possibilities.concat(intent.listPossibilities(creep));
                }
            }
            var possibility;
            possibilities.forEach(
                (current) => {
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
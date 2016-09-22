var intents = require("intents");

module.exports.processIntents = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (!creep.memory.intent) {
            for (var intent in intents) {
                intents[intent].ponder(creep);
                if (creep.memory.intent) {
                    break;
                }
            }
        }

        intents[creep.memory.intent].pursue(creep);
    }
};
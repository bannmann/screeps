const BASE_IMPORTANCE = 0.55;
const COST_PER_SIZE = 150;
const PARTS_PER_SIZE = 2;
var armyManager = require("armyManager");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (armyManager.isRecruiting(room, "dismantler")) {
            result.push({
                importance: BASE_IMPORTANCE,
                body: this.getBody(room),
                onStartSpawning: (creep) => {
                    creep.notifyWhenAttacked(false);
                }
            });
        }

        return result;
    },

    getBody: function(room) {
        var creepSize = this.getAppropriateCreepSize(room);
        var configuration = [];
        for (var i = 0; i < creepSize; i++) {
            configuration.push(MOVE);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(WORK);
        }
        return configuration;
    },

    getAppropriateCreepSize: function(room) {
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    }
};
require('util_profiler').registerModule(module);
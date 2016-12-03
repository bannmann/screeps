const BASE_IMPORTANCE = 0.5;
const COST_PER_SIZE = 260;
var armyManager = require("armyManager");

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0;

        if (armyManager.isRecruiting) {
            result = BASE_IMPORTANCE;
        }

        return result;
    },
    getCost: function(room, spawnManager) {
        return this.getAppropriateCreepSize(room, spawnManager) * COST_PER_SIZE;
    },
    getBody: function(room, spawnManager) {
        var creepSize = this.getAppropriateCreepSize(room, spawnManager);
        var configuration = [];
        for (var i = 0; i < creepSize; i++) {
            configuration.push(TOUGH);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(MOVE);
            configuration.push(MOVE);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(RANGED_ATTACK);
        }
        return configuration;
    },
    getAppropriateCreepSize(room, spawnManager) {
        var result = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        return result;
    }
};
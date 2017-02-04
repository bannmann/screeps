const BASE_IMPORTANCE = 0.6;
const COST_PER_SIZE = 190;
const PARTS_PER_SIZE = 4;
var armyManager = require("armyManager");

module.exports = {
    getCurrentImportance: function(spawn) {
        var result = 0;

        if (armyManager.isRecruiting()) {
            result = BASE_IMPORTANCE;
        }

        return result;
    },
    getCost: function(room) {
        return this.getAppropriateCreepSize(room) * COST_PER_SIZE;
    },
    getBody: function(room) {
        var creepSize = this.getAppropriateCreepSize(room);
        var configuration = [];
        for (var i = 0; i < creepSize; i++) {
            configuration.push(TOUGH);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(MOVE);
            configuration.push(MOVE);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(ATTACK);
        }
        return configuration;
    },
    getAppropriateCreepSize(room) {
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    }
};
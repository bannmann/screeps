const BASE_IMPORTANCE = 0.8;
const PARTS_PER_SIZE = 4;
const DEFENSE_FACTOR = 2;
const COST_PER_SIZE = 190;
var creepDirectory = require("creepDirectory");

module.exports = {
    getCurrentImportance: function(spawn) {
        var result = 0;

        var room = spawn.room;
        var enemies = room.find(FIND_HOSTILE_CREEPS).length;
        if (enemies > 0) {
            var activeDefenders = creepDirectory.getRoomRaceCount(room.name, "defender");
            if (activeDefenders < enemies * DEFENSE_FACTOR) {
                result = BASE_IMPORTANCE;
            }
        }

        return result;
    },

    getCost: function(room) {
        var energy = room.energyAvailable;
        return Math.max(COST_PER_SIZE, energy - (energy % COST_PER_SIZE));
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
        var maximumSize = Math.floor(room.energyAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    }
};
const BASE_IMPORTANCE = 0.8;
const DEFENSE_FACTOR = 2;
const BASE_COST = 190;
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
        return Math.max(BASE_COST, energy - (energy % BASE_COST));
    },
    getBody: function(room) {
        var creepSize = Math.floor(room.energyAvailable / BASE_COST);
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
    }
};
const BASE_IMPORTANCE = 0.8;
const PARTS_PER_SIZE = 4;
const DEFENSE_FACTOR = 2;
const COST_PER_SIZE = 190;
var creepDirectory = require("creepDirectory");

module.exports = {
    getPlans: function(room) {
        var result = [];

        var enemies = room.find(FIND_HOSTILE_CREEPS).length;
        if (enemies > 0) {
            var activeDefenders = creepDirectory.getRoomRaceCount(room.name, "defender");
            if (activeDefenders < enemies * DEFENSE_FACTOR) {
                result.push({
                    importance: BASE_IMPORTANCE,
                    body: this.getBody(room)
                });
            }
        }

        return result;
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

    getAppropriateCreepSize: function(room) {
        var maximumSize = Math.floor(room.energyAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    }
};
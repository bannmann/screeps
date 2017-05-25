const BASE_IMPORTANCE = 0.6;
const COST_PER_SIZE = 190;
const PARTS_PER_SIZE = 4;
var armyManager = require("armyManager");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (armyManager.isRecruiting(room, "attacker")) {
            result.push({
                importance: BASE_IMPORTANCE,
                body: this.getBody(room)
            });
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
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    },

    initializeCreep: function(creep) {
        creep.notifyWhenAttacked(false);
    }
};
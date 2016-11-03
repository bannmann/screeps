const BASE_IMPORTANCE = 0.8;
const DEFENSE_FACTOR = 2;

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0;

        var enemies = spawn.room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length > 0) {
            var creeps = spawn.room.find(FIND_MY_CREEPS);
            var activeFighters = _.filter(creeps, function(creep) { return creep.memory.race == "fighter"; }).length;
            if (activeFighters < enemies.length * DEFENSE_FACTOR) {
                result = BASE_IMPORTANCE;
            }
        }

        return result;
    },
    getCost: function(room, spawnManager) {
        var capacity = room.energyCapacityAvailable;
        return capacity - (capacity % 260);
    },
    getBody: function(room, spawnManager) {
        var creepSize = Math.floor(room.energyCapacityAvailable / 260);
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
    }
};
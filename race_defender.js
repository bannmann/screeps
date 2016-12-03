const BASE_IMPORTANCE = 0.8;
const DEFENSE_FACTOR = 2;
const BASE_COST = 260;

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0;

        var enemies = spawn.room.find(FIND_HOSTILE_CREEPS).length;
        if (enemies > 0) {
            var activeFighters = spawnManager.getCreepCountByRace("defender");
            if (activeFighters < enemies * DEFENSE_FACTOR) {
                result = BASE_IMPORTANCE;
            }
        }

        return result;
    },
    getCost: function(room, spawnManager) {
        var energy = room.energyAvailable;
        return Math.max(BASE_COST, energy - (energy % BASE_COST));
    },
    getBody: function(room, spawnManager) {
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
            configuration.push(RANGED_ATTACK);
        }
        return configuration;
    }
};
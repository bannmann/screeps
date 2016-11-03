const COST_PER_SIZE = 250;

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0.1;
        if (spawnManager.getCreepCount() == 0) {
            result = 0.99;
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
            configuration.push(WORK);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(CARRY);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(MOVE);
            configuration.push(MOVE);
        }
        return configuration;
    },
    getAppropriateCreepSize(room, spawnManager) {
        var result = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);

        // If no creeps are left, the first creep should be a small one that can help us gain energy
        if (spawnManager.getCreepCount() == 0) {
            result = 1;
        }

        return result;
    }
};
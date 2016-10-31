module.exports = {
    getCurrentImportance: function(spawn) {
        return 0.1;
    },
    getCost: function(room) {
        var capacity = room.energyCapacityAvailable;
        return capacity - (capacity % 250);
    },
    getConfiguration(room) {
        var creepSize = Math.floor(room.energyCapacityAvailable / 250);
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
    }
};
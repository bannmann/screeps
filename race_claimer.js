const BASE_IMPORTANCE = 0.5;

var logger = require("logger");

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0;
        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("claim") && flag.room == spawn.room && spawnManager.getCreepCountByRace("claimer") == 0) {
                    result = BASE_IMPORTANCE;
                }
            });

        return result;
    },
    getCost: function(room, spawnManager) {
        return 650;
    },
    getBody(room, spawnManager) {
        return [MOVE, CLAIM];
    }
};
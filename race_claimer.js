const BASE_IMPORTANCE = 0.5;

var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports = {
    getCurrentImportance: function(spawn) {
        var result = 0;
        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("claim") && flag.room == spawn.room && creepDirectory.getGlobalRaceCount("claimer") == 0) {
                    result = BASE_IMPORTANCE;
                }
            });

        return result;
    },
    getCost: function(room) {
        return 650;
    },
    getBody(room) {
        return [MOVE, CLAIM];
    }
};
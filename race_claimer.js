const BASE_IMPORTANCE = 0.5;

var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (room.energyCapacityAvailable >= BODYPART_COST[MOVE] + BODYPART_COST[CLAIM]) {
            _.each(Game.flags,
                (flag)=> {
                    if (flag.name.startsWith("claim") && flag.room == room && creepDirectory.getGlobalRaceCount("claimer") == 0) {
                        result = [{
                            importance: BASE_IMPORTANCE,
                            body: [MOVE, CLAIM]
                        }];
                    }
                });
        }

        return result;
    }
};
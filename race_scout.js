const BASE_IMPORTANCE = 0.2;
const ROOM_RANGE = 6;

var creepDirectory = require("creepDirectory");

module.exports = {
    getPlans: function(room) {
        var result = [];

        _.each(
            Game.flags, (flag)=> {
                if (flag.name.startsWith("scout") && this.isScoutNeeded() && this.isInScoutingRange(room, flag)) {
                    result = [{
                        importance: BASE_IMPORTANCE,
                        body: [MOVE]
                    }];
                }
            });

        return result;
    },

    isScoutNeeded: function() {
        return creepDirectory.getGlobalRaceCount("scout") == 0;
    },

    isInScoutingRange: function(room, flag) {
        return Game.map.getRoomLinearDistance(room.name, flag.pos.roomName) <= ROOM_RANGE;
    },

    initializeCreep: function(creep) {
        creep.notifyWhenAttacked(false);
    }
};
require('util_profiler').registerModule(module);
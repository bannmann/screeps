const BASE_IMPORTANCE = 0.5;
const MAX_ROOM_DISTANCE = 10;

var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (room.energyCapacityAvailable >= BODYPART_COST[MOVE] + BODYPART_COST[CLAIM]) {
            _.each(Game.flags,
                (flag)=> {
                    if (flag.name.startsWith("claim") && creepDirectory.getGlobalRaceCount("claimer") == 0) {
                        var spawnRoomInfo = flag.pos.getNearestSpawnRoom();
                        if (spawnRoomInfo.roomName == room.name) {
                            if (spawnRoomInfo.distance <= MAX_ROOM_DISTANCE) {
                                result = [{
                                    importance: BASE_IMPORTANCE, body: [MOVE, CLAIM]
                                }];
                            } else {
                                console.log(
                                    "Nearest spawn room for claiming " + flag.pos.roomName + " is " + room.name +
                                    ", which is too far away (" + spawnRoomInfo.distance + ")");
                            }
                        }
                    }
                });
        }

        return result;
    }
};
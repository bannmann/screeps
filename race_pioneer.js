const COST_PER_SIZE = BODYPART_COST[TOUGH] * 2 + BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE] * 4;
const FIXED_COSTS = BODYPART_COST[MOVE] + BODYPART_COST[HEAL];
const PARTS_PER_SIZE = 8;
const FIXED_PARTS = 2;
const PIONEER_COUNT = 5;

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var cpuUsage = require("cpuUsage");

module.exports = {
    getPlans: function(room) {
        var result = [];

        _.each(this.getPioneerTargetRoomNames(), (roomName) => {
            // Only send pioneers from the nearest room
            if (this.getNearestSpawnRoomName(roomName) == room.name) {
                var workersPresent = creepDirectory.getRoomRaceCount(roomName, "worker");

                // This won't work correctly for multiple concurrently bootstrapping rooms, but it suffices for now.
                var pioneersUnderway = creepDirectory.getGlobalRaceCount("pioneer");

                if (workersPresent + pioneersUnderway < PIONEER_COUNT) {
                    result.push({
                        importance: 0.8,
                        body: this.getBody(room),
                        memory: {
                            pioneeringRoomName: roomName
                        }
                    });
                }
            }
        });

        return result;
    },

    getPioneerTargetRoomNames: function() {
        var result = [];
        _.each(Game.rooms, (room) => {
            if (room.my && !room.hasOwnSpawns) {
                result.push(room.name);
            }
        });
        _.each(Game.flags, (flag) => {
            if (flag.name.startsWith("pioneer")) {
                result.push(flag.pos.roomName);
            }
        });
        return result;
    },

    getNearestSpawnRoomName: function(roomName) {
        var position = new RoomPosition(25, 25, roomName);
        return position.getNearestSpawnRoom().roomName;
    },

    getBody: function(room) {
        var creepSize = this.getAppropriateCreepSize(room);

        var configuration = [];
        for (var i = 0; i < creepSize; i++) {
            configuration.push(TOUGH);
            configuration.push(TOUGH);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(WORK);
            configuration.push(CARRY);
        }
        for (var i = 0; i < creepSize * 4; i++) {
            configuration.push(MOVE);
        }

        // Fixed parts
        configuration.push(MOVE);
        configuration.push(HEAL);

        return configuration;
    },

    getAppropriateCreepSize: function(room) {
        var maximumSize = Math.floor((room.energyCapacityAvailable - FIXED_COSTS) / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor((50 - FIXED_PARTS) / PARTS_PER_SIZE));
        return result;
    },

    getWorkerCount: function(room) {
        return creepDirectory.getRoomRaceCount(room.name, "worker");
    }
};
require('util_profiler').registerModule(module);
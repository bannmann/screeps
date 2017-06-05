const COST_PER_SIZE = 250;
const PARTS_PER_SIZE = 4;
const PIONEER_COUNT = 5;

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var cpuUsage = require("cpuUsage");

module.exports = {
    getPlans: function(room) {
        var result = [];

        _.each(this.getBootstrappingRooms(), (bootstrappingRoom) => {
            // Only send pioneers from the nearest room
            if (this.getResponsibleRoomName(bootstrappingRoom) == room.name) {
                var workersPresent = creepDirectory.getRoomRaceCount(bootstrappingRoom.name, "worker");

                // This won't work correctly for multiple concurrently bootstrapping rooms, but it suffices for now.
                var pioneersUnderway = creepDirectory.getGlobalRaceCount("pioneer");

                if (workersPresent + pioneersUnderway < PIONEER_COUNT) {
                    result.push({
                        importance: 0.8,
                        body: this.getBody(room),
                        memory: {
                            pioneeringRoomName: bootstrappingRoom.name
                        }
                    });
                }
            }
        });

        return result;
    },

    getBootstrappingRooms: function() {
        return _.filter(Game.rooms, (room) => room.my && room.find(FIND_MY_SPAWNS).length == 0);
    },

    getResponsibleRoomName: function(bootstrappingRoom) {
        var result = null;
        var resultDistance = Number.MAX_VALUE;
        _.each(this.getActiveRooms(), (activeRoom) => {
            var distance = Game.map.getRoomLinearDistance(activeRoom.name, bootstrappingRoom.name);
            if (distance < resultDistance) {
                resultDistance = distance;
                result = activeRoom.name;
            }
        });
        return result;
    },

    getActiveRooms: function() {
        return _.filter(Game.rooms, (room) => room.my && room.find(FIND_MY_SPAWNS).length > 0);
    },

    getBody: function(room) {
        var creepSize = this.getAppropriateCreepSize(room);

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

    getAppropriateCreepSize: function(room) {
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));
        return result;
    },

    getWorkerCount: function(room) {
        return creepDirectory.getRoomRaceCount(room.name, "worker");
    }
};
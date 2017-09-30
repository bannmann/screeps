var logger = require("logger");
var Objects = require("util_objects");
var playerDirectory = require("playerDirectory");

module.exports = {
    onTickStarting: function() {
        _.each(Game.rooms, (room) => {
            if (!room.my) {
                var roomData = Objects.loadPath(Memory, ["RoomDirectory", "rooms"], room.name) || {};
                roomData.lastScan = Game.time;
                if (room.username != roomData.username) {
                    roomData.enemyTerritory = playerDirectory.isEnemyPlayer(room.username);
                    roomData.username = room.username;
                }
                Objects.savePath(Memory, ["RoomDirectory", "rooms"], room.name, roomData);
            } else {
                Objects.deletePath(Memory, ["RoomDirectory", "rooms"], room.name);
            }
        });
    },

    isEnemyTerritory: function(roomName) {
        return this.getRoomProperty(roomName, "enemyTerritory");
    },

    getRoomProperty: function(roomName, propertyName) {
        return Objects.loadPath(Memory, ["RoomDirectory", "rooms", roomName], propertyName);
    }
};
require('util_profiler').registerModule(module);
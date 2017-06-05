var _ = require("lodash");

module.exports.apply = function() {
    RoomPosition.prototype.getApproximateRangeTo = function(arg1, arg2) {
        var otherPosition;
        if (arg1 instanceof RoomPosition) {
            otherPosition = arg1;
        } else if (arg1 instanceof RoomObject) {
            otherPosition = arg1.pos;
        } else {
            otherPosition = new RoomPosition(arg1, arg2, this.roomName);
        }

        var result;
        if (this.roomName == otherPosition.roomName) {
            result = this.getRangeTo(otherPosition);
        } else {
            /*
             * We don't use the in-room coordinates, but the paths inside should be half a room on average. As the
             * method getRoomLinearDistance() returns 1 for neighbouring rooms, these paths are implicitly counted.
             */
            result = Game.map.getRoomLinearDistance(this.roomName, otherPosition.roomName) * 50;
        }
        return result;
    };

    RoomPosition.prototype.getNearestSpawnRoom = function() {
        var spawnRooms = _.filter(Game.rooms, (room) => room.my && room.find(FIND_MY_SPAWNS).length > 0);

        var result = { distance: Number.MAX_VALUE, room: null, roomName: null };
        _.each(spawnRooms, (spawnRoom) => {
            var distance = Game.map.getRoomLinearDistance(spawnRoom.name, this.roomName);
            if (distance < result.distance) {
                result.distance = distance;
                result.roomName = spawnRoom.name;
                result.room = spawnRoom;
            }
        });
        return result;
    }
};
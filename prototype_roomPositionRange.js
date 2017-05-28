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
};
var _ = require("lodash");

const MODIFIERS_BY_DIRECTION = [
    null,
    [0, -1], // TOP = 1
    [+1, -1],
    [+1, 0],
    [+1, +1],
    [0, +1],
    [-1, +1],
    [-1, 0],
    [-1, -1] // TOP_LEFT = 8
];

module.exports.apply = function() {
    RoomPosition.prototype.applyDirection = function(direction) {
        var mod = MODIFIERS_BY_DIRECTION[direction];
        if (!mod) {
            return ERR_INVALID_ARGS;
        }
        var x = this.x + mod[0];
        var y = this.y + mod[1];
        if (x < 0 || x > 49 || y < 0 || y > 49) {
            return ERR_INVALID_ARGS;
        }
        return new RoomPosition(x, y, this.roomName);
    };
};
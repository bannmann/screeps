var _ = require("lodash");

module.exports.apply = function() {
    RoomPosition.prototype.hasObstacle = function() {
        var result = false;
        _.each(
            this.look(), (look) => {
                if (look.type == LOOK_CREEPS ||
                    look.type == LOOK_STRUCTURES && look.structure.structureType != STRUCTURE_RAMPART ||
                    look.type == LOOK_TERRAIN && look.terrain == "wall") {
                    result = true;
                    return false;
                }
            });
        return result;
    };
};
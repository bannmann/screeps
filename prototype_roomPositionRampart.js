var _ = require("lodash");

module.exports.apply = function() {
    RoomPosition.prototype.hasRampart = function() {
        var result = false;
        _.each(
            this.lookFor(LOOK_STRUCTURES), (structure) => {
                if (structure.structureType == STRUCTURE_RAMPART) {
                    result = true;
                    return false;
                }
            });
        return result;
    };
};
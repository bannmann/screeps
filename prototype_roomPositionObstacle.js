var _ = require("lodash");

module.exports.apply = function() {
    RoomPosition.prototype.hasObstacle = function() {
        return this.hasTerrainWall() || this.hasNonRampartStructure() || this.hasCreep();
    };

    RoomPosition.prototype.hasTerrainWall = function() {
        return _.some(this.lookFor(LOOK_TERRAIN), (terrainType) => terrainType == "wall");
    };

    RoomPosition.prototype.hasNonRampartStructure = function() {
        return _.some(this.lookFor(LOOK_STRUCTURES), (structure) => structure.structureType != STRUCTURE_RAMPART);
    };

    RoomPosition.prototype.hasCreep = function() {
        return this.lookFor(LOOK_CREEPS).length > 0;
    };
};
module.exports = {
    name: "transferToMyStructure", ponder: function(creep) {
        if (creep.carry.energy ==
            creep.carryCapacity &&
            creep.room.energyAvailable <
            creep.room.energyCapacityAvailable) {
            var target = creep.pos.findClosestByPath(
                FIND_STRUCTURES, {
                    filter: (structure) => (
                    structure.structureType ==
                    STRUCTURE_EXTENSION ||
                    structure.structureType ==
                    STRUCTURE_SPAWN ||
                    structure.structureType ==
                    STRUCTURE_TOWER) && structure.energy < structure.energyCapacity
                });
            if (target) {
                creep.memory.intent = this.name;
                creep.memory.target = target.id;
            }
        }
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        if (creep.carry.energy == 0) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
    }
};
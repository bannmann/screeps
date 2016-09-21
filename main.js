module.exports.loop = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.carry.energy < creep.carryCapacity) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
        else {
            var target = creep.pos.findClosestByPath(
                FIND_STRUCTURES, {
                    filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity
                });
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }

    for (var name in Game.spawns) {
        var spawn = Game.spawns[name];
        spawn.createCreep([WORK, MOVE, CARRY]);
    }
};
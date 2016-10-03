module.exports = {
    range: 1, canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy > 0;
    }, listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            if (structure.structureType ==
                STRUCTURE_EXTENSION ||
                structure.structureType ==
                STRUCTURE_SPAWN ||
                structure.structureType ==
                STRUCTURE_TOWER) {
                var path = creep.pos.findPathTo(structure, {ignoreCreeps: true});

                var freeEnergy = structure.energyCapacity - structure.energy;
                var importance = (
                    freeEnergy / structure.energyCapacity) * (
                    1 / (
                    path.length - this.range));

                result.push(
                    {
                        importance: importance,
                        target: structure.id,
                        path: Room.serializePath(path),
                        choose: function() {
                            creep.memory.intent = "transferToMyStructure";
                            creep.memory.target = this.target;
                            creep.memory.path = this.path;
                        }
                    });
            }
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            if (creep.moveByPath(creep.memory.path) != OK) {
                creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
            }
            if (creep.pos.getRangeTo(target) <= this.range) {
                delete creep.memory.path;
            }
        }
        else {
            creep.transfer(target, RESOURCE_ENERGY);
            if (creep.carry.energy == 0 || target.energy == target.energyCapacity) {
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
module.exports = {
    canBePerformedBy: function(creep) {
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

                var freeEnergy = structure.energyCapacity - structure.energy - structure.calculateExpectedEnergy();
                var importance = freeEnergy / structure.energyCapacity;

                result.push(
                    {
                        importance: importance, choose: function() {
                        structure.registerDelivery(creep);
                        creep.memory.intent = "transferToMyStructure";
                        creep.memory.target = structure.id;
                        creep.memory.path = Room.serializePath(path);
                    }
                    });
            }
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            creep.moveByPath(creep.memory.path);
            if (creep.pos.getRangeTo(target) <= 1) {
                delete creep.memory.path;
            }
        }
        else {
            creep.transfer(target, RESOURCE_ENERGY);
            if (creep.carry.energy == 0 || target.energy == target.energyCapacity) {
                target.deregisterDelivery(creep);
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
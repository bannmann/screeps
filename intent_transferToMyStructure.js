var moveAction = require("action_move");

module.exports = {
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            if (structure.structureType ==
                STRUCTURE_EXTENSION ||
                structure.structureType ==
                STRUCTURE_SPAWN ||
                structure.structureType ==
                STRUCTURE_TOWER) {

                var freeEnergy = structure.energyCapacity -
                    Math.min(structure.energy + structure.calculateExpectedEnergy(), structure.energyCapacity);
                var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                var path = creep.pos.findPathTo(structure, {ignoreCreeps: true});
                var shortDistance = 1 / (path.length - this.range);

                var importance = 0.3 + needsMuchEnergy * 0.1 + shortDistance * 0.05;

                result.push(
                    {
                        importance: importance,
                        target: structure,
                        path: path,
                        choose: function() {
                            this.target.registerDelivery(creep);
                            creep.memory.intent = "transferToMyStructure";
                            creep.memory.target = this.target.id;

                            moveAction.start(creep, this.path);
                        }
                    });
            }
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == 0 || target.energy == target.energyCapacity) {
            target.deregisterDelivery(creep);
            delete creep.memory.intent;
            delete creep.memory.target;
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            creep.transfer(target, RESOURCE_ENERGY);
        }
    }
};
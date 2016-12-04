var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "chargeTower",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) > 0 && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            if (structure.structureType == STRUCTURE_TOWER && structure.room == creep.room) {
                var freeEnergy = structure.energyCapacity -
                    Math.min(structure.energy + structure.calculateExpectedEnergy(), structure.energyCapacity);
                if (freeEnergy > 0) {
                    var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                    var importance = 0.25 + needsMuchEnergy * 0.1;

                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: structure,
                        shortDistanceFactor: 0.05,
                        baseImportance: importance,
                        preparationFunction: function() {
                            creep.memory.target = this.roomObject.id;
                            this.roomObject.registerDelivery(creep);
                        }
                    }));
                }
            }
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == 0 || target.energy == target.energyCapacity) {
            target.deregisterDelivery(creep);
            intentsUtil.reset(creep);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            if (creep.transfer(target, RESOURCE_ENERGY) != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
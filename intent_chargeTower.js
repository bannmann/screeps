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
        _.each(Game.structures, (structure) => {
            if (structure.structureType == STRUCTURE_TOWER && structure.room == creep.room) {
                var freeEnergy = structure.energyCapacity -
                    Math.min(structure.energy + structure.calculateExpectedEnergyDelta(), structure.energyCapacity);
                if (freeEnergy > 0) {
                    var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                    var importance = 0.2 + needsMuchEnergy * 0.3;

                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: structure,
                        shortDistanceFactor: 0.05,
                        baseImportance: importance,
                        preparationFunction: function() {
                            creep.memory.target = this.roomObject.id;
                            this.roomObject.registerEnergyTransaction(creep, creep.carry.energy);
                        }
                    }));
                }
            }
        });
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == 0) {
            intentsUtil.abort(creep, this, "no energy");
        }
        else if (target.energy == target.energyCapacity) {
            intentsUtil.abort(creep, this, "target " + creep.memory.target + " being full");
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            target.deregisterEnergyTransaction(creep);
            intentsUtil.finish(creep, this, creep.transfer(target, RESOURCE_ENERGY));
        }
    }
};
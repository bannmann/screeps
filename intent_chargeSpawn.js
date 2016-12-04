// If we have fewer creeps, this intent is more important than anything else, or we'll never spawn more creeps
const CREEP_COUNT_THRESHOLD = 5;

var moveAction = require("action_move");
var spawnManager = require("spawnManager");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "chargeSpawn",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) > 0 && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            var isSpawnOrExtension = structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
            if (isSpawnOrExtension &&  structure.room == creep.room) {

                var freeEnergy = structure.energyCapacity -
                    Math.min(structure.energy + structure.calculateExpectedEnergy(), structure.energyCapacity);
                if (freeEnergy > 0) {
                    var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                    var fewCreepsActive = (spawnManager.getCreepCount() < CREEP_COUNT_THRESHOLD) * 1;

                    var importance = 0.3 + fewCreepsActive * 0.5 + needsMuchEnergy * 0.1;

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
// If we have fewer creeps, this intent is more important than anything else, or we'll never spawn more creeps
const CREEP_COUNT_THRESHOLD = 5;

var moveAction = require("action_move");
var spawnManager = require("spawnManager");
var intentsUtil = require("util_intents");

module.exports = {
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) > 0 && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;
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
                if (freeEnergy > 0) {
                    var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                    var path = creep.pos.findPathTo(structure, {ignoreCreeps: true});
                    var shortDistance = intentsUtil.getShortDistanceFactor(path, this.range);

                    var fewCreepsActive = (spawnManager.getCreepCount() < CREEP_COUNT_THRESHOLD) * 1;

                    var importance = 0.3 + fewCreepsActive * 0.5 + needsMuchEnergy * 0.1 + shortDistance * 0.05;

                    result.push(
                        {
                            importance: importance,
                            target: structure,
                            path: path,
                            choose: function() {
                                this.target.registerDelivery(creep);
                                creep.memory.intent = "transferToMyStructure";
                                creep.memory.target = this.target.id;

                                moveAction.start(creep, this.path, thisIntent.range);
                            }
                        });
                }
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
            moveAction.perform(creep);
        }
        else {
            creep.transfer(target, RESOURCE_ENERGY);
        }
    }
};
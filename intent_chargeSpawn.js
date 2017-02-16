// If we have fewer creeps, this intent is more important than anything else, or we'll never spawn more creeps
const CREEP_COUNT_THRESHOLD = 5;

var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var creepDirectory = require("creepDirectory");

module.exports = {
    name: "chargeSpawn",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) > 0 && creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        _.each(Game.structures, (structure) => {
            var isSpawnOrExtension = structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
            if (isSpawnOrExtension &&  structure.room == creep.room) {

                var freeEnergy = structure.energyCapacity -
                    Math.min(structure.energy + structure.calculateExpectedEnergyDelta(), structure.energyCapacity);
                if (freeEnergy > 0) {
                    var needsMuchEnergy = freeEnergy / structure.energyCapacity;

                    var workerCount = creepDirectory.getRoomRaceCount(creep.room.name, "worker");
                    var fewWorkersActive = (workerCount < CREEP_COUNT_THRESHOLD) * 1;

                    var importance = 0.3 + fewWorkersActive * 0.5 + needsMuchEnergy * 0.1;

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
        if (!target) {
            intentsUtil.abort(creep, this, "missing target " + creep.memory.target);
        }
        else if (creep.carry.energy == 0) {
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
var INTENT = require("intent");
var memoryCleaner = require("memoryCleaner");
var spawnManager = require("spawnManager");

module.exports.loop = function() {
    memoryCleaner.clean();

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        var target;
        switch (creep.memory.intent) {
            case INTENT.HARVEST_ENERGY:
                target = creep.pos.findClosestByPath(FIND_SOURCES);
                if (target) {
                    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    else if (creep.carry.energy == creep.carryCapacity) {
                        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                            creep.memory.intent = INTENT.TRANSFER_TO_MY_STRUCTURE;
                        }
                        else {
                            creep.memory.intent = INTENT.TRANSFER_TO_CONTROLLER;
                        }
                    }
                }
                break;
            case INTENT.TRANSFER_TO_CONTROLLER:
                target = creep.pos.findClosestByPath(
                    FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER
                    });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    else if (creep.carry.energy == 0) {
                        creep.memory.intent = INTENT.HARVEST_ENERGY;
                    }
                }
                break;
            case INTENT.TRANSFER_TO_MY_STRUCTURE:
                target = creep.pos.findClosestByPath(
                    FIND_STRUCTURES, {
                        filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                        structure.energy < structure.energyCapacity
                    });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    else if (creep.carry.energy == 0) {
                        creep.memory.intent = INTENT.HARVEST_ENERGY;
                    }
                }
                else {
                    creep.memory.intent = INTENT.TRANSFER_TO_CONTROLLER;
                }
                break;
        }
    }

    spawnManager.spawnCreepIfNecessary();
};
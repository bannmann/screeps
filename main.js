var INTENT = {
    HARVEST_ENERGY: "HARVEST_ENERGY",
    TRANSFER_TO_MY_STRUCTURE: "TRANSFER_TO_MY_STRUCTURE",
    TRANSFER_TO_CONTROLLER: "TRANSFER_TO_CONTROLLER"
};

module.exports.loop = function() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    var creepNumber = 0;
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
                        if (creepNumber % 5 == 0 && creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
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
                break;
        }

        creepNumber++;
    }

    if (creepNumber < 20) {
        for (var name in Game.spawns) {
            var spawn = Game.spawns[name];
            spawn.createCreep([WORK, MOVE, CARRY], undefined, {intent: INTENT.HARVEST_ENERGY});
        }
    }
};
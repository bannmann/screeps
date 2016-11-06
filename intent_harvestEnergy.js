var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "harvestEnergy",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) && creep.carry.energy == 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var sources = room.find(FIND_SOURCES);
            sources.forEach(
                (source)=> {
                    if (!moveAction.isTargetJammed(source)) {
                        var muchEnergyLeft = source.energy / source.energyCapacity;
                        var baseImportance = 0.7 + muchEnergyLeft * 0.05;

                        result.push(new Possibility({
                            creep: creep,
                            intent: this,
                            roomObject: source,
                            shortDistanceFactor: 0.1,
                            baseImportance: baseImportance,
                            preparationFunction: function() {
                                creep.memory.target = this.roomObject.id;
                            }
                        }));
                    }
                });
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == creep.carryCapacity || target == null || target.energy == 0) {
            intentsUtil.reset(creep);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            if (creep.harvest(target) != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
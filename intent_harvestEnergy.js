var moveAction = require("action_move");
var intentsUtil = require("util_intents");

module.exports = {
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
                        var path = creep.pos.findPathTo(source, {ignoreCreeps: true});

                        var shortDistance = intentsUtil.getShortDistanceFactor(path, this.range);
                        var muchEnergyLeft = source.energy / source.energyCapacity;
                        var importance = 0.7 + shortDistance * 0.1 + muchEnergyLeft * 0.05;

                        result.push(
                            {
                                importance: importance,
                                target: source,
                                path: path,
                                choose: function() {
                                    creep.memory.intent = "harvestEnergy";
                                    creep.memory.target = this.target.id;

                                    moveAction.start(creep, this.path, thisIntent.range);
                                }
                            });
                    }
                });
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == creep.carryCapacity || target.energy == 0) {
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
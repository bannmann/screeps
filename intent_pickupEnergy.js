var moveAction = require("action_move");
var intentsUtil = require("util_intents");

module.exports = {
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) && creep.carry.energy < creep.carryCapacity;
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var droppedEnergies = room.find(FIND_DROPPED_ENERGY, {
                // Avoid picking up energy on room exit tiles as it makes creeps oscillate between two rooms.
                filter: (drop) => !this.placedOnRoomExit(drop)
            });
            droppedEnergies.forEach(
                (droppedEnergy) => {
                    var carryCapacity = creep.carryCapacity;
                    var droppedAmount = droppedEnergy.energy;

                    var path = creep.pos.findPathTo(droppedEnergy, {ignoreCreeps: true});

                    // Don't calculate a factor > 1 if there's more energy than the creep can carry
                    var valuable = Math.min(droppedAmount, carryCapacity) / carryCapacity;

                    var shortDistance = intentsUtil.getShortDistanceFactor(path, this.range);

                    var importance = 0.8 + valuable * 0.05 + shortDistance * 0.05;

                    result.push(
                        {
                            importance: importance, target: droppedEnergy, path: path, choose: function() {
                                creep.memory.intent = "pickupEnergy";
                                creep.memory.target = this.target.id;

                                moveAction.start(creep, this.path, thisIntent.range);
                            }
                        });
                });
        }
        return result;
    },
    placedOnRoomExit: function(roomObject) {
        return roomObject.pos.x == 0 || roomObject.pos.y == 0 || roomObject.pos.x == 49 || roomObject.pos.y == 49;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target || creep.carry.energy == creep.carryCapacity) {
            intentsUtil.reset(creep);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            if (creep.pickup(target) != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
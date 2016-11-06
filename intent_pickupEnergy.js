var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "pickupEnergy",
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

                    // Don't calculate a factor > 1 if there's more energy than the creep can carry
                    var valuable = Math.min(droppedAmount, carryCapacity) / carryCapacity;

                    var baseImportance = 0.8 + valuable * 0.05;

                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: droppedEnergy,
                        shortDistanceFactor: 0.05,
                        baseImportance: baseImportance,
                        preparationFunction: function() {
                            creep.memory.target = this.roomObject.id;
                        }
                    }));
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
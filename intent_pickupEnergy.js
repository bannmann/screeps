var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var enemyDirectory = require("enemyDirectory");

module.exports = {
    name: "pickupEnergy",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) && creep.empty;
    },
    listPossibilities: function(creep) {
        var result = [];

        if (!enemyDirectory.enemiesPresent(creep.room)) {
            var droppedEnergies = creep.room.find(
                FIND_DROPPED_RESOURCES, {
                    // Avoid picking up energy on room exit tiles as it makes creeps oscillate between two rooms.
                    filter: (drop) => !this.placedOnRoomExit(drop)
                });
            _.each(
                droppedEnergies, (droppedEnergy) => {
                    var energyAvailable = droppedEnergy.energy + droppedEnergy.calculateExpectedEnergyDelta();
                    if (energyAvailable > 0) {
                        var carryCapacity = creep.carryCapacity;
                        var energyToTake = Math.min(energyAvailable, carryCapacity);
                        var valuable = energyToTake / carryCapacity;

                        var baseImportance = 0.76 + valuable * 0.03;

                        result.push(
                            new Possibility(
                                {
                                    creep: creep,
                                    intent: this,
                                    roomObject: droppedEnergy,
                                    shortDistanceFactor: 0.02,
                                    baseImportance: baseImportance,
                                    energyAmount: energyToTake,
                                    preparationFunction: function() {
                                        creep.memory.target = this.roomObject.id;
                                        this.roomObject.registerEnergyTransaction(creep, -this.energyAmount);
                                    }
                                }));
                    }
                });
        }

        return result;
    },
    placedOnRoomExit: function(roomObject) {
        return roomObject.pos.x == 0 || roomObject.pos.y == 0 || roomObject.pos.x == 49 || roomObject.pos.y == 49;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            intentsUtil.abort(creep, this, "missing target " + creep.memory.target);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            target.deregisterEnergyTransaction(creep);
            intentsUtil.finish(creep, this, creep.pickup(target));
        }
    }
};
require('util_profiler').registerModule(module);
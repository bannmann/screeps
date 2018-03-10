var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var enemyDirectory = require("enemyDirectory");

module.exports = {
    name: "lootTombstone",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) && creep.empty;
    },
    listPossibilities: function(creep) {
        var result = [];

        var tombstones = creep.room.find(FIND_TOMBSTONES);
        _.each(
            tombstones, (tombstone) => {
                var energyAvailable = tombstone.store[RESOURCE_ENERGY] + tombstone.calculateExpectedEnergyDelta();
                if (energyAvailable > 0) {
                    var carryCapacity = creep.carryCapacity;
                    var energyToTake = Math.min(energyAvailable, carryCapacity);
                    var valuable = energyToTake / carryCapacity;
                    var baseImportance = 0.7 + valuable * 0.03;
                    result.push(
                        new Possibility(
                            {
                                creep: creep,
                                intent: this,
                                roomObject: tombstone,
                                shortDistanceFactor: 0.02,
                                baseImportance: baseImportance,
                                intentStatus: {
                                    energy: energyToTake
                                },
                                preparationFunction: function() {
                                    creep.memory.target = this.roomObject.id;
                                    this.roomObject.registerEnergyTransaction(creep, -this.intentStatus.energy);
                                }
                            }));
                }
            });

        return result;
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
            intentsUtil.finish(creep, this, creep.withdraw(target, RESOURCE_ENERGY, creep.memory.intentStatus.energy));
        }
    }
};
require('util_profiler').registerModule(module);
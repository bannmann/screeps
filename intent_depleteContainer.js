var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "depleteContainer",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) && creep.empty;
    },
    listPossibilities: function(creep) {
        var result = [];

        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
        });
        _.each(containers,
            (container) => {
                var energyAvailable = container.store.energy + container.calculateExpectedEnergyDelta();
                if (energyAvailable > 0) {
                    var damaged = 1 / container.hits;
                    var decaysSoon = 1 / container.ticksToDecay;

                    var baseImportance = 0.8 + damaged * 0.05 + decaysSoon * 0.1;

                    var energyToTake = Math.min(energyAvailable, creep.carryCapacity);

                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: container,
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
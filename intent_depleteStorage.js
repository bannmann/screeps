var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "depleteStorage",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CARRY) && creep.empty;
    },
    listPossibilities: function(creep) {
        var result = [];

        var storage = creep.room.storage;
        if (storage && !storage.my && !storage.pos.hasRampart()) {
            var energyAvailable = storage.store.energy + storage.calculateExpectedEnergyDelta();
            if (energyAvailable > 0) {
                var energyToTake = Math.min(energyAvailable, creep.carryCapacity);

                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: storage,
                    shortDistanceFactor: 0,
                    baseImportance: 0.8,
                    intentStatus: {
                        energy: energyToTake
                    },
                    preparationFunction: function() {
                        storage.registerEnergyTransaction(creep, -this.intentStatus.energy);
                    }
                }));
            }
        }

        return result;
    },
    pursue: function(creep) {
        var target = creep.room.storage;
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
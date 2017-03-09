var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var logger = require("logger");

module.exports = {
    name: "harvestEnergy",
    range: 1,

    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) && creep.carry.energy == 0;
    },

    listPossibilities: function(creep) {
        var result = [];
        _.each(creep.room.find(FIND_SOURCES),
            (source) => {
                if (source.energy > 0 && this.isHarvestable(source) && !this.isJammed(source)) {
                    var muchEnergyLeft = source.energy / source.energyCapacity;
                    var baseImportance = 0.7 + muchEnergyLeft * 0.01;

                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: source,
                        shortDistanceFactor: 0.04,
                        baseImportance: baseImportance,
                        preparationFunction: function() {
                            creep.memory.target = this.roomObject.id;
                        }
                    }));
                }
            });
        return result;
    },

    isHarvestable: function(source) {
        var result = true;

        var controller = source.room.controller;
        if (controller)
        {
            var myRoom = controller.my;
            var neutralRoom = !!controller.owner;
            var reservedForOtherPlayer = controller.reservation && controller.reservation.username != Game.username;

            result = myRoom || neutralRoom && !reservedForOtherPlayer;
        }

        return result;
    },

    isJammed: function(source) {
        return moveAction.isTargetJammed(source);
    },

    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (target == null) {
            intentsUtil.abort(creep, this, "missing target " + creep.memory.target);
        }
        else if (target.energy == 0) {
            intentsUtil.abort(creep, this, "empty target " + creep.memory.target);
        }
        else if (creep.carry.energy == creep.carryCapacity) {
            intentsUtil.reset(creep);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            var harvestResult = creep.harvest(target);
            if (harvestResult != OK) {
                intentsUtil.abort(creep, this, harvestResult);
            }
        }
    }
};
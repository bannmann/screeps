var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "meleeAttack",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, ATTACK);
    },
    listPossibilities: function(creep) {
        var result = [];

        _.each(creep.room.find(FIND_HOSTILE_CREEPS),
            (enemy) => {
                var wounded = (enemy.hitsMax - enemy.hits) / enemy.hitsMax;
                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: enemy,
                    shortDistanceFactor: 0.025,
                    baseImportance: 0.8 + enemy.canHeal * 0.1 + wounded * 0.05,
                    preparationFunction: function() {
                        creep.memory.target = this.roomObject.id;
                    }
                }));
            });

        _.each(creep.room.find(FIND_HOSTILE_STRUCTURES),
            (structure) => {
                var towerFactor = (structure.structureType == STRUCTURE_TOWER) * 1;
                var spawnFactor = (structure.structureType == STRUCTURE_SPAWN) * 1;

                // hitsMax can be zero for leftover ramparts in uncontrolled rooms.
                var damaged = 0;
                if (structure.hitsMax > 0) {
                    damaged = (structure.hitsMax - structure.hits) / structure.hitsMax;
                }

                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: structure,
                    shortDistanceFactor: 0.025,
                    baseImportance: 0.6 + towerFactor * 0.1 + spawnFactor * 0.09 + damaged * 0.05,
                    preparationFunction: function() {
                        creep.memory.target = this.roomObject.id;
                    }
                }));
            });

        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            intentsUtil.reset(creep);
        }
        else {
            var result = creep.attack(target);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (result != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
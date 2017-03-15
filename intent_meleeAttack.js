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

        // Healer 0.8+
        // Worker 0.7+
        _.each(creep.room.find(FIND_HOSTILE_CREEPS),
            (enemy) => {
                var wounded = (enemy.hitsMax - enemy.hits) / enemy.hitsMax;
                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: enemy,
                    shortDistanceFactor: 0.025,
                    baseImportance: 0.7 + enemy.canHeal * 0.1 + wounded * 0.05,
                    preparationFunction: function() {
                        creep.memory.target = this.roomObject.id;
                    }
                }));
            });

        var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            // Controllers are included in FIND_HOSTILE_STRUCTURES, but are invincible
            filter: (structure) => structure.structureType != STRUCTURE_CONTROLLER
        });

        // Tower 0.9+
        // Spawn 0.79+
        _.each(hostileStructures,
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
                    baseImportance: 0.7 + towerFactor * 0.2 + spawnFactor * 0.09 + damaged * 0.05,
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
            var attackResult = creep.attack(target);
            if (attackResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (attackResult != OK) {
                intentsUtil.abort(creep, this, "attackResult " + attackResult);
            }
        }
    }
};
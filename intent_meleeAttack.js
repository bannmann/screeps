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
        _.each(Game.rooms, (room) => {
            _.each(room.find(FIND_HOSTILE_CREEPS),
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

            _.each(room.find(FIND_HOSTILE_STRUCTURES),
                (structure) => {
                    var damaged = (structure.hitsMax - structure.hits) / structure.hitsMax;
                    if (structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_SPAWN) {
                        var towerFactor = (structure.structureType == STRUCTURE_TOWER) * 1;
                        result.push(new Possibility({
                            creep: creep,
                            intent: this,
                            roomObject: structure,
                            shortDistanceFactor: 0.025,
                            baseImportance: 0.6 + towerFactor * 0.1 + damaged * 0.05,
                            preparationFunction: function() {
                                creep.memory.target = this.roomObject.id;
                            }
                        }));
                    }
                });
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
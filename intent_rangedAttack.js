var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "rangedAttack",
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, RANGED_ATTACK);
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var enemies = room.find(FIND_HOSTILE_CREEPS);
            enemies.forEach(
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
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            intentsUtil.reset(creep);
        }
        else {
            var result = creep.rangedAttack(target);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (result != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
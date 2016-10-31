module.exports = {
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(RANGED_ATTACK) >
            0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var enemies = room.find(FIND_HOSTILE_CREEPS);
            enemies.forEach(
                (enemy) => {
                    var path = creep.pos.findPathTo(enemy, {ignoreCreeps: true});

                    var shortDistance = 1 / (path.length - this.range);
                    var importance = 0.8 + shortDistance * 0.1;

                    result.push(
                        {
                            importance: importance,
                            target: enemy,
                            path: path,
                            choose: function() {
                                creep.memory.intent = "rangedAttack";
                                creep.memory.target = this.target.id;
                            }
                        });
                });
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
        else {
            if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};
var INTENT = require("intent");

module.exports.spawnCreepIfNecessary = function() {
    var creepCount = Object.keys(Game.creeps).length;
    if (creepCount < 20) {
        for (var name in Game.spawns) {
            var spawn = Game.spawns[name];
            spawn.createCreep([WORK, MOVE, MOVE, CARRY], undefined, {intent: INTENT.HARVEST_ENERGY});
        }
    }
};
module.exports.spawnCreepIfNecessary = function() {
    var creepCount = Object.keys(Game.creeps).length;
    if (creepCount < 20) {
        for (var name in Game.spawns) {
            var spawn = Game.spawns[name];
            var creepSize = Math.floor(spawn.room.energyCapacityAvailable / 250);
            if (spawn.room.energyAvailable >= creepSize * 250) {
                var body = [];
                for (var i = 0; i < creepSize; i++) {
                    body.push(WORK);
                }
                for (var i = 0; i < creepSize; i++) {
                    body.push(CARRY);
                }
                for (var i = 0; i < creepSize; i++) {
                    body.push(MOVE);
                    body.push(MOVE);
                }
                spawn.createCreep(body);
            }
        }
    }
};
module.exports.spawnCreepIfNecessary = function() {
    if (shouldSpawnCreeps()) {
        var spawned = false;
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
                spawned = true;
            }
        }
        if (spawned) {
            console.log("Spawned more creeps, now at " + getCreepCount());
        }
    }

    function shouldSpawnCreeps() {
        var result;
        if (simulationModeActive()) {
            result = belowSimulationCreepCount();
        } else {
            result = cpuUsageTooLow();
        }
        return result;
    }

    function simulationModeActive() {
        return Game.cpu.getUsed() == 0;
    }

    function cpuUsageTooLow() {
        return Game.cpu.getUsed() < Game.cpu.limit * 0.8;
    }

    function belowSimulationCreepCount() {
        return getCreepCount() < 20;
    }

    function getCreepCount() {
        return Object.keys(Game.creeps).length;
    }
};
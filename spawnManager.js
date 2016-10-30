module.exports = {
    idleCreepCount: 0,

    reset: function() {
        this.idleCreepCount = 0;
    },

    registerIdleCreep: function() {
        this.idleCreepCount++;
    },

    spawnCreepIfNecessary: function() {
        if (this.shouldSpawnCreeps()) {
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
        }
    },

    shouldSpawnCreeps: function() {
        return this.currentCreepsAreBusy() && this.moreCreepsPossible();
    },

    currentCreepsAreBusy: function() {
        return this.idleCreepCount == 0;
    },

    moreCreepsPossible: function() {
        var result;
        if (this.simulationModeActive()) {
            result = this.belowSimulationCreepCount();
        }
        else {
            result = this.cpuUsageTooLow();
        }
        return result;
    },

    simulationModeActive: function() {
        return Game.cpu.getUsed() == 0;
    },

    cpuUsageTooLow: function() {
        return Game.cpu.getUsed() < Game.cpu.limit * 0.8;
    },

    belowSimulationCreepCount: function() {
        return this.getCreepCount() < 50;
    },

    getCreepCount: function() {
        return Object.keys(Game.creeps).length;
    }
};
const MAX_CREEP_COUNT_LIST_LENGTH = 10;
const ACCEPTABLE_IDLE_CREEPS = 0;

module.exports = {
    idleCreepCountList: Memory["IdleCreepCounts"] || [],
    currentIdleCreepCount: 0,

    saveIdleCreepCount: function() {
        this.idleCreepCountList.push(this.currentIdleCreepCount);

        while (this.idleCreepCountList.length > MAX_CREEP_COUNT_LIST_LENGTH) {
            this.idleCreepCountList.shift();
        }
        Memory["IdleCreepCounts"] = this.idleCreepCountList;
    },

    registerIdleCreep: function() {
        this.currentIdleCreepCount++;
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
        return !this.idleCreepCountList.find(function(element) {return element > ACCEPTABLE_IDLE_CREEPS});
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
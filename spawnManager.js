const MAX_CREEP_COUNT_LIST_LENGTH = 10;
const ACCEPTABLE_IDLE_CREEPS = 0;

var bodies = require("bodies");

module.exports = {
    idleCreepCountList: Memory["IdleCreepCounts"] || [],
    currentIdleCreepCount: 0,

    saveIdleCreepCount: function() {
        this.idleCreepCountList.push(this.currentIdleCreepCount);

        while (this.idleCreepCountList.length > MAX_CREEP_COUNT_LIST_LENGTH) {
            this.idleCreepCountList.shift();
        }
        Memory["IdleCreepCounts"] = this.idleCreepCountList;
        this.currentIdleCreepCount = 0;
    },

    registerIdleCreep: function() {
        this.currentIdleCreepCount++;
    },

    spawnCreepIfNecessary: function() {
        if (this.shouldSpawnCreeps()) {
            var plan = null;
            for (var name in Game.spawns) {
                var spawn = Game.spawns[name];

                for (var bodyName in bodies) {
                    var body = bodies[bodyName];
                    var importance = body.getCurrentImportance(spawn, this);

                    if (importance > 0 && (!plan || importance > plan.importance)) {
                        plan = {
                            importance: importance,
                            body: body,
                            bodyName: bodyName,
                            spawn: spawn
                        };
                    }
                }
            }

            if (plan) {
                var room = spawn.room;
                var body = plan.body;
                var spawn = plan.spawn;
                if (room.energyAvailable >= body.getCost(room, this)) {
                    spawn.createCreep(body.getConfiguration(room, this), undefined, {type: plan.bodyName});
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
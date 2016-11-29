const MAX_CREEP_COUNT_LIST_LENGTH = 10;
const ACCEPTABLE_IDLE_CREEPS = 0;

var races = require("races");

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

                for (var raceName in races) {
                    var race = races[raceName];
                    var importance = race.getCurrentImportance(spawn, this);

                    if (importance > 0 && (!plan || importance > plan.importance)) {
                        plan = {
                            importance: importance,
                            race: race,
                            raceName: raceName,
                            spawn: spawn
                        };
                    }
                }
            }

            if (plan) {
                var room = spawn.room;
                var race = plan.race;
                var spawn = plan.spawn;
                if (room.energyAvailable >= race.getCost(room, this)) {
                    spawn.createCreep(race.getBody(room, this), undefined, {race: plan.raceName});
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
        return Game.cpu.getUsed() < Game.cpu.limit * 0.7;
    },

    belowSimulationCreepCount: function() {
        return this.getCreepCount() < 50;
    },

    getCreepCount: function() {
        return Object.keys(Game.creeps).length;
    },

    getCreepCountByRace: function(race) {
        return _.filter(Game.creeps, function(creep) { return creep.memory.race == race; }).length;
    }
};
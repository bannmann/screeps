const COST_PER_SIZE = 250;
const PARTS_PER_SIZE = 4;
const BASE_WORKER_COUNT = 2;
const MAX_IDLE_RATIO = 0.1;

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var cpuUsage = require("cpuUsage");
var creepStats = require("creepStats");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (this.areCreepsBusy(room) && this.areWorkersMature(room) && cpuUsage.isLow()) {
            var importance = 0.1;
            if (this.getWorkerCount(room) < BASE_WORKER_COUNT) {
                importance = 0.9;
            }
            result.push({
                importance: importance,
                body: this.getBody(room)
            });
        }

        return result;
    },

    areCreepsBusy: function(room) {
        var idleTickRatio = creepStats.getRelativeTickCount(
            room,
            "idleTicks",
            {filter: (creep) => creep.memory.race == "worker"});
        return !idleTickRatio || idleTickRatio < MAX_IDLE_RATIO;
    },

    areWorkersMature: function(room) {
        var findOptions = {filter: (creep) => creep.memory.race == "worker"};
        var ages = _.map(room.find(FIND_MY_CREEPS, findOptions), (creep) => creep.ticksLived);
        return _.min(ages) >= 100;
    },

    getBody: function(room) {
        var creepSize = this.getAppropriateCreepSize(room);

        var configuration = [];
        for (var i = 0; i < creepSize; i++) {
            configuration.push(WORK);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(CARRY);
        }
        for (var i = 0; i < creepSize; i++) {
            configuration.push(MOVE);
            configuration.push(MOVE);
        }
        return configuration;
    },

    getAppropriateCreepSize: function(room) {
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));

        // If no or few workers are left, we should quickly spawn small ones that can help us gain energy.
        var activeWorkers = this.getWorkerCount(room);
        if (activeWorkers < BASE_WORKER_COUNT) {
            result = Math.min(activeWorkers + 1, result);
        }

        return result;
    },

    getWorkerCount: function(room) {
        return creepDirectory.getRoomRaceCount(room.name, "worker");
    }
};
require('util_profiler').registerModule(module);
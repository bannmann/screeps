const COST_PER_SIZE = 250;
const PARTS_PER_SIZE = 4;
const BASE_WORKER_COUNT = 2;
const HISTORY_LENGTH = 10;
const ACCEPTABLE_IDLE_CREEPS = 0;

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var flagDirectory = require("flagDirectory");
var cpuUsage = require("cpuUsage");

module.exports = {
    getPlans: function(room) {
        var result = [];

        if (this.areCreepsBusy(room) && cpuUsage.isLow()) {
            if (creepDirectory.getRoomRaceCount(room.name, "worker") < BASE_WORKER_COUNT) {
                result = 0.9;
            } else {
                result = 0.1;
            }
            result.push({
                importance: importance,
                body: this.getBody(room)
            });
        }

        return result;
    },

    areCreepsBusy: function(room) {
        var result = !this.data.rooms[room.name].pastIdleCreepCounts.find(
            (element) => {
                return element > ACCEPTABLE_IDLE_CREEPS;
            });
        return result;
    },

    moreCreepsPossible: function() {
        var result;
        if (this.simulationModeActive()) {
            result = this.belowSimulationCreepCount();
        }
        else {
            result = this.isCpuUsageLow();
        }
        return result;
    },

    simulationModeActive: function() {
        return Game.cpu.getUsed() == 0;
    },

    belowSimulationCreepCount: function() {
        return creepDirectory.getOverallCount() < 50;
    },

    getCost: function(room) {
        return this.getAppropriateCreepSize(room) * COST_PER_SIZE;
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

    getAppropriateCreepSize(room) {
        var maximumSize = Math.floor(room.energyCapacityAvailable / COST_PER_SIZE);
        var result = Math.min(maximumSize, Math.floor(50 / PARTS_PER_SIZE));

        // If no or few workers are left, we should quickly spawn small ones that can help us gain energy.
        var activeWorkers = creepDirectory.getRoomRaceCount(room.name, "worker");
        if (activeWorkers < BASE_WORKER_COUNT) {
            result = Math.min(activeWorkers + 1, result);
        }

        return result;
    },

    onTickStarting: function() {
        this.data = Memory.WorkerRace || {};

        if (!this.data.rooms) {
            this.data.rooms = {};
        }

        _.eachRight(this.data.rooms,
            (roomData, roomName) =>{
                if (!Game.rooms[roomName]) {
                    delete this.data.rooms[roomName];
                }
            });

        _.each(Game.rooms,
            (room, roomName) =>{
                if (!this.data.rooms[roomName]) {
                    this.data.rooms[roomName] = {
                        pastIdleCreepCounts: []
                    };
                }
                this.data.rooms[roomName].currentIdleCreeps = 0;
            });
    },

    registerIdleCreep: function(creep) {
        this.data.rooms[creep.room.name].currentIdleCreeps++;
    },

    onTickEnding: function() {
        _.each(this.data.rooms,
            (roomData) =>{
                roomData.pastIdleCreepCounts.push(roomData.currentIdleCreeps);

                while (roomData.pastIdleCreepCounts.length > HISTORY_LENGTH) {
                    roomData.pastIdleCreepCounts.shift();
                }
            });

        Memory.WorkerRace = this.data;
    }
};
const DEPLOYED = "DEPLOYED";
const READY = "READY";
const ROOM_RANGE = 5;

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var flagDirectory = require("flagDirectory");
var Objects = require("util_objects");

var data = {};

module.exports = {
    initialize: function() {
        data = {
            required: {},
            shouldDeploy: false,
            targetFlag: null,
            gatheringFlag: null
        };

        var targetFlagInfo = flagDirectory.getFlagInfo("offensive");
        if (targetFlagInfo) {
            _.each(targetFlagInfo.value.split(","), (entry) => {
                var tokens = entry.split(":");
                data.required[tokens[0]] = parseInt(tokens[1]);
            });

            data.targetFlag = targetFlagInfo.flag;

            var gatheringFlagInfo = flagDirectory.getFlagInfo("gathering");
            if (gatheringFlagInfo) {
                data.gatheringFlag = gatheringFlagInfo.flag;
            }

            var creepsDeployed = false;
            var ready = {};
            _.each(Game.creeps,
                (creep) => {
                    var raceName = creep.memory.race;
                    if (raceName in data.required && !creep.spawning) {
                        if (this.isDeployed(creep)) {
                            creepsDeployed = true;
                        } else if (this.isReady(creep)) {
                            Objects.increaseCounter(ready, raceName);
                        }
                    }
                });

            // Do not send reinforcements one by one, but send a new offensive with full strength.
            if (!creepsDeployed) {
                var newOffensiveReady = true;
                _.each(
                    data.required, (requiredCount, raceName) => {
                        var readyCount = ready[raceName];
                        if (!readyCount || readyCount < requiredCount) {
                            newOffensiveReady = false;
                            return false;
                        }
                    });

                data.shouldDeploy = newOffensiveReady;
            }
        }
    },

    markDeployed: function(creep) {
        creep.memory.offensiveStatus = DEPLOYED;
    },

    markReady: function(creep) {
        creep.memory.offensiveStatus = READY;
    },

    isRecruiting: function(room, raceName) {
        return !!data.targetFlag && this.needsRace(raceName) && this.isInRecruitingRange(room);
    },

    needsRace: function(raceName) {
        var raceCount = creepDirectory.getGlobalRaceCount(raceName);
        var isNeeded = (!raceCount || raceCount < data.required[raceName]);
        return isNeeded;
    },

    isInRecruitingRange: function(room) {
        var flag = this.getGatheringFlag();
        if (!flag) {
            flag = this.getTargetFlag();
        }
        return flag && Game.map.getRoomLinearDistance(room.name, flag.pos.roomName) <= ROOM_RANGE;
    },

    shouldDeployCreeps: function() {
        return data.shouldDeploy;
    },

    isManaged: function(creep) {
        return creep.memory.race in data.required;
    },

    isDeployed: function(creep) {
        return creep.memory.offensiveStatus == DEPLOYED;
    },

    isReady: function(creep) {
        return !this.getGatheringFlag() || creep.memory.offensiveStatus == READY;
    },

    getTargetFlag: function() {
        return data.targetFlag;
    },

    getGatheringFlag: function() {
        return data.gatheringFlag;
    }
};
require('util_profiler').registerModule(module);
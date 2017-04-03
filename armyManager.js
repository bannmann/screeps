const DEPLOYED = "DEPLOYED";
const READY = "READY";

var logger = require("logger");
var creepDirectory = require("creepDirectory");
var flagDirectory = require("flagDirectory");

var data = {};

module.exports = {
    initialize: function() {
        data.desiredOffensiveSize = 0;
        var targetFlagInfo = flagDirectory.getFlagInfo("offensive");
        if (targetFlagInfo) {
            data.desiredOffensiveSize = parseInt(targetFlagInfo.value);
            data.targetFlag = targetFlagInfo.flag;
        }
        var gatheringFlagInfo = flagDirectory.getFlagInfo("gathering");
        if (gatheringFlagInfo) {
            data.gatheringFlag = gatheringFlagInfo.flag;
        }

        data.readyAttackers = 0;
        data.deployedAttackers = 0;
        data.totalSpawnedAttackers = 0;

        _.each(Game.creeps,
            (creep) => {
                if (creep.memory.race == "attacker" && !creep.spawning) {
                    data.totalSpawnedAttackers++;

                    if (this.isDeployed(creep)) {
                        data.deployedAttackers++;
                    } else if (this.isReady(creep)) {
                        data.readyAttackers++;
                    }
                }
            });

        data.offensiveActive = data.desiredOffensiveSize > 0;
    },

    markDeployed: function(creep) {
        creep.memory.offensiveStatus = DEPLOYED;
    },

    markReady: function(creep) {
        creep.memory.offensiveStatus = READY;
    },

    isRecruiting: function() {
        var spawningAndSpawnedAttackers = creepDirectory.getGlobalRaceCount("attacker");
        return data.offensiveActive && spawningAndSpawnedAttackers < data.desiredOffensiveSize;
    },

    shouldDeployCreeps: function() {
        // Do not send reinforcements one by one, but send a new offensive with full strength.
        return data.offensiveActive && data.readyAttackers >= data.desiredOffensiveSize && data.deployedAttackers == 0;
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
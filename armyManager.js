const FLAG_PREFIX = "offensive=";

var logger = require("logger");
var creepDirectory = require("creepDirectory");

var data = {};

module.exports = {
    initialize: function() {
        data.desiredOffensiveSize = 0;
        _.each(Game.flags,
            (flag) => {
                if (flag.name.startsWith(FLAG_PREFIX)) {
                    data.desiredOffensiveSize = parseInt(flag.name.substr(FLAG_PREFIX.length));
                    data.targetFlag = flag;
                }
            });

        data.deployedAttackers = 0;
        data.totalSpawnedAttackers = 0;

        _.each(Game.creeps,
            (creep) => {
                if (creep.memory.race == "attacker" && !creep.spawning) {
                    data.totalSpawnedAttackers++;

                    if (this.isDeployed(creep)) {
                        data.deployedAttackers++;
                    }
                }
            });

        data.offensiveActive = data.desiredOffensiveSize > 0;
    },

    markDeployed: function(creep) {
        creep.memory.offensiveStatus = "DEPLOYED";
    },

    isRecruiting: function() {
        var spawningAndSpawnedAttackers = creepDirectory.getGlobalRaceCount("attacker");
        return data.offensiveActive && spawningAndSpawnedAttackers < data.desiredOffensiveSize;
    },

    shouldDeployCreeps: function() {
        // Do not send reinforcements one by one, but send a new offensive with full strength.
        return data.offensiveActive && data.totalSpawnedAttackers >= data.desiredOffensiveSize && data.deployedAttackers == 0;
    },

    isDeployed: function(creep) {
        return creep.memory.offensiveStatus == "DEPLOYED";
    },

    getTargetFlag: function() {
        return data.targetFlag;
    }
};
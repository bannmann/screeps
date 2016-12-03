const FLAG_PREFIX = "offensive=";

var logger = require("logger");

module.exports = {
    initialize: function() {
        this.desiredOffensiveSize = 0;
        _.each(Game.flags,
            (flag) => {
                if (flag.name.startsWith(FLAG_PREFIX)) {
                    this.desiredOffensiveSize = parseInt(flag.name.substr(FLAG_PREFIX.length));
                    this.targetFlag = flag;
                }
            });

        this.deployedCreeps = 0;
        this.totalCreeps = 0;
        _.each(Game.creeps,
            (creep) => {
                if (creep.memory.race == "attacker" && !creep.spawning) {
                    this.totalCreeps++;

                    if (this.isDeployed(creep)) {
                        this.deployedCreeps++;
                    }
                }
            });

        this.offensiveActive = this.desiredOffensiveSize > 0;

        this.isRecruiting = this.offensiveActive && this.totalCreeps < this.desiredOffensiveSize;

        // Do not send reinforcements one by one, but send a new offensive with full strength.
        this.shouldDeployCreeps = this.offensiveActive && !this.isRecruiting && this.deployedCreeps == 0;
    },

    markDeployed: function(creep) {
        creep.memory.offensiveStatus = "DEPLOYED";
    },

    isDeployed: function(creep) {
        return creep.memory.offensiveStatus == "DEPLOYED";
    }
};
var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var enemyDirectory = require("enemyDirectory");

module.exports = {
    name: "build",
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) && this.isPermitted(creep) && creep.carry.energy > 0;
    },
    isPermitted: function(creep) {
        // If there is a spawn, don't suck up all creeps for building - always leave some for 'chargeSpawn' intent
        return !creep.room.hasOwnSpawns || creep.belongsToGroup(0, 2);
    },
    listPossibilities: function(creep) {
        var result = [];
        _.each(Game.constructionSites, (site) => {
            if (site.room == creep.room) {
                var muchProgress = site.progress / site.progressTotal;
                var baseImportance = 0.4 + muchProgress * 0.1;

                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: site,
                    shortDistanceFactor: 0.05,
                    baseImportance: baseImportance,
                    preparationFunction: function() {
                        creep.memory.target = this.roomObject.id;
                    }
                }));
            }
        });
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            intentsUtil.abort(creep, this, "missing target " + creep.memory.target);
        }
        else if (creep.carry.energy == 0) {
            intentsUtil.abort(creep, this, "no energy");
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            var buildResult = creep.build(target);
            if (buildResult != OK) {
                intentsUtil.abort(creep, this, buildResult);
            }
        }
    }
};
require('util_profiler').registerModule(module);
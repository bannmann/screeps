var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "build",
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) &&
            // avoid sucking up all creeps for building, always leave some for 'chargeSpawn' intent
            creep.belongsToGroup(0, 2) &&
            creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;
        for (var constructionSiteId in Game.constructionSites) {
            var constructionSite = Game.constructionSites[constructionSiteId];

            var muchProgress = constructionSite.progress / constructionSite.progressTotal;
            var baseImportance = 0.4 + muchProgress * 0.1;

            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: constructionSite,
                shortDistanceFactor: 0.05,
                baseImportance: baseImportance,
                preparationFunction: function() {
                    creep.memory.target = this.roomObject.id;
                }
            }));
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target || creep.carry.energy == 0) {
            intentsUtil.reset(creep);
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            if (creep.build(target) != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
var moveAction = require("action_move");
var intentsUtil = require("util_intents");

module.exports = {
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK, CARRY) &&
            // avoid sucking up all creeps for building, always leave some for 'transferToMyStructure' intent
            creep.belongsToGroup(0, 2) &&
            creep.carry.energy > 0;
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;
        for (var constructionSiteId in Game.constructionSites) {
            var constructionSite = Game.constructionSites[constructionSiteId];

            var path = creep.pos.findPathTo(constructionSite, {ignoreCreeps: true});

            var muchProgress = constructionSite.progress / constructionSite.progressTotal;
            var shortDistance = intentsUtil.getShortDistanceFactor(path, this.range);
            var importance = 0.4 + muchProgress * 0.1 + shortDistance * 0.05;

            result.push(
                {
                    importance: importance,
                    target: constructionSite,
                    path: path,
                    choose: function() {
                        creep.memory.intent = "build";
                        creep.memory.target = this.target.id;

                        moveAction.start(creep, this.path, thisIntent.range);
                    }
                });
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
module.exports = {
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(WORK) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy >
            0;
    }, listPossibilities: function(creep) {
        var result = [];
        for (var constructionSiteId in Game.constructionSites) {
            var constructionSite = Game.constructionSites[constructionSiteId];

            var path = creep.pos.findPathTo(constructionSite, {ignoreCreeps: true});

            var importance = constructionSite.progress / constructionSite.progressTotal;

            result.push(
                {
                    importance: importance, choose: function() {
                    creep.memory.intent = "build";
                    creep.memory.target = constructionSite.id;
                    creep.memory.path = Room.serializePath(path);
                }
                });
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            creep.moveByPath(creep.memory.path);
            if (creep.pos.getRangeTo(target) <= 3) {
                delete creep.memory.path;
            }
        }
        else {
            creep.build(target);
            if (!target || creep.carry.energy == 0) {
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
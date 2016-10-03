module.exports = {
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(WORK) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy >
            0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var constructionSiteId in Game.constructionSites) {
            var constructionSite = Game.constructionSites[constructionSiteId];

            var path = creep.pos.findPathTo(constructionSite, {ignoreCreeps: true});

            var importance = (
                constructionSite.progress / constructionSite.progressTotal) * (
                1 / (
                path.length - this.range));

            result.push(
                {
                    importance: importance,
                    target: constructionSite.id,
                    path: Room.serializePath(path),
                    choose: function() {
                        creep.memory.intent = "build";
                        creep.memory.target = this.target;
                        creep.memory.path = this.path;
                    }
                });
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target || creep.carry.energy == 0) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
        else if (creep.memory.path) {
            if (creep.moveByPath(creep.memory.path) != OK) {
                creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
            }
            if (creep.pos.getRangeTo(target) <= this.range) {
                delete creep.memory.path;
            }
        }
        else {
            creep.build(target);
        }
    }
};
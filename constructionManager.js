module.exports.manage = function() {
    _.each(Game.flags,
        (flag)=> {
            if (flag.name.startsWith("spawnLocation") && flag.room && flag.room.controller && flag.room.controller.my) {
                flag.room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
                flag.remove();
            }
        });
};
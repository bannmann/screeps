const BASE_IMPORTANCE = 0.2;

module.exports = {
    getCurrentImportance: function(spawn, spawnManager) {
        var result = 0;

        _.each(
            Game.flags, (flag)=> {
                if (flag.name.startsWith("scout") && spawnManager.getCreepCountByRace("scout") == 0) {
                    result = BASE_IMPORTANCE;
                }
            });

        return result;
    }, getCost: function(room, spawnManager) {
        return 50;
    }, getBody(room, spawnManager) {
        return [MOVE];
    }
};
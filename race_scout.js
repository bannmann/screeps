const BASE_IMPORTANCE = 0.2;
var creepDirectory = require("creepDirectory");

module.exports = {
    getCurrentImportance: function(spawn) {
        var result = 0;

        _.each(
            Game.flags, (flag)=> {
                if (flag.name.startsWith("scout") && creepDirectory.getGlobalRaceCount("scout") == 0) {
                    result = BASE_IMPORTANCE;
                }
            });

        return result;
    }, getCost: function(room) {
        return 50;
    }, getBody(room) {
        return [MOVE];
    }
};
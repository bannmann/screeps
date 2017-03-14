const BASE_IMPORTANCE = 0.2;
var creepDirectory = require("creepDirectory");

module.exports = {
    getPlans: function(room) {
        var result = [];

        _.each(
            Game.flags, (flag)=> {
                if (flag.name.startsWith("scout") && creepDirectory.getGlobalRaceCount("scout") == 0) {
                    result = [{
                        importance: BASE_IMPORTANCE,
                        body: [MOVE]
                    }];
                }
            });

        return result;
    },

    initializeCreep: function(creep) {
        creep.notifyWhenAttacked(false);
    }
};
var races = require("races");
var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports = {
    spawnCreepIfNecessary: function() {
        _.each(Game.spawns,
            (spawn) => {
                if (!spawn.spawning) {
                    var room = spawn.room;

                    var chosenPlan = null;
                    _.each(races, (race, raceName) => {
                        var plans = race.getPlans(room);

                        _.each(plans, (plan) => {
                            if (plan.importance > 0 && (!chosenPlan || plan.importance > chosenPlan.importance)) {
                                chosenPlan = plan;
                                chosenPlan.race = race;
                                chosenPlan.raceName = raceName;
                            }
                        });
                    });
                    if (chosenPlan) {
                        if (room.energyAvailable >= this.calculateCost(chosenPlan.body)) {
                            var raceName = chosenPlan.raceName;

                            var creepMemory = _.extend({}, chosenPlan.memory, { race: raceName });
                            var result = spawn.createCreep(chosenPlan.body, undefined, creepMemory);
                            if (_.isString(result)) {
                                creepDirectory.addCreep(room.name, raceName);
                                var creep = Game.creeps[result];
                                if ("onStartSpawning" in chosenPlan) {
                                    chosenPlan.onStartSpawning(creep);
                                }
                            } else {
                                logger.log(
                                    "Spawning " + JSON.stringify(chosenPlan) + " in room " + room.name +
                                    " resulted in " + result);
                            }
                        }
                    }
                }
            });
    },

    calculateCost: function(body) {
        var result = 0;
        _.each(body, (part) => {
            result += BODYPART_COST[part];
        });
        return result;
    }
};
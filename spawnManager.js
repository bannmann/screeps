var races = require("races");
var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports = {
    spawnCreepIfNecessary: function() {
        _.each(Game.spawns,
            (spawn) => {
                if (!spawn.spawning) {
                    var plan = null;

                    _.each(races, (race, raceName) => {
                        var importance = race.getCurrentImportance(spawn);

                        if (importance > 0 && (!plan || importance > plan.importance)) {
                            plan = {
                                importance: importance,
                                race: race,
                                raceName: raceName,
                                spawn: spawn
                            };
                        }
                    });
                    if (plan) {
                        var room = spawn.room;
                        var race = plan.race;
                        if (room.energyAvailable >= race.getCost(room)) {
                            var raceName = plan.raceName;

                            var result = spawn.createCreep(race.getBody(room), undefined, {race: raceName});
                            if (result) {
                                creepDirectory.addCreep(room.name, raceName);
                            }
                        }
                    }
                }
            });
    }
};
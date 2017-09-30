const FLAG_PREFIX = "dismantle";

var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "dismantle",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, WORK);
    },
    listPossibilities: function(creep) {
        var result = [];

        var chosenStructure = null;
        var chosenNumber = Number.MAX_VALUE;
        var flags = creep.room.find(FIND_FLAGS, { filter: (flag) => flag.name.indexOf(FLAG_PREFIX) == 0});
        _.each(
            flags, (flag) => {
                var number = parseInt(flag.name.substr(FLAG_PREFIX.length));
                if (!chosenStructure || number < chosenNumber) {
                    var structures = flag.pos.lookFor(LOOK_STRUCTURES);
                    if (structures.length) {
                        _.each(structures, (structure) => {
                            if (structure.structureType != STRUCTURE_ROAD) {
                                chosenStructure = structure;
                                chosenNumber = number;
                            }
                        });
                    }
                }
            });

        if (chosenStructure) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: chosenStructure,
                baseImportance: 0.8,
                intentStatus: {
                    structureId: chosenStructure.id
                }
            }));
        }

        return result;
    },
    pursue: function(creep) {
        var structure = Game.getObjectById(creep.memory.intentStatus.structureId);
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            var dismantleResult = creep.dismantle(structure);
            if (dismantleResult != OK) {
                intentsUtil.abort(creep, this, dismantleResult);
            }
        }
    }
};
require('util_profiler').registerModule(module);
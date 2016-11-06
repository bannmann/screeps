var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "claimRoom",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CLAIM);
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;

        var controller = creep.room.controller;
        if (controller && !controller.owner) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: controller,
                shortDistanceFactor: 0,
                baseImportance: 0.5,
                preparationFunction: function() {
                    creep.memory.target = this.roomObject.id;
                }
            }));
        }

        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (target.my) {
            intentsUtil.reset(creep);

            _.each(Game.flags,
                (flag)=> {
                    if (flag.name.startsWith("claim")) {
                        flag.remove();
                    }
                });
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            if (creep.claimController(target) != OK) {
                intentsUtil.reset(creep);
            }
        }
    }
};
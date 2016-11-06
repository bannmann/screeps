var moveAction = require("action_move");
var intentsUtil = require("util_intents");

module.exports = {
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CLAIM);
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;

        var controller = creep.room.controller;
        if (controller && !controller.owner) {
            var path = creep.pos.findPathTo(controller, {ignoreCreeps: true});

            result.push(
                {
                    importance: 0.5,
                    target: controller,
                    path: path,
                    choose: function() {
                        creep.memory.intent = "claimRoom";
                        creep.memory.target = this.target.id;

                        moveAction.start(creep, this.path, thisIntent.range);
                    }
                });
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
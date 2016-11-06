var moveAction = require("action_move");
var intentsUtil = require("util_intents");

module.exports = {
    range: 0,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CLAIM);
    },
    listPossibilities: function(creep) {
        var result = [];
        var thisIntent = this;

        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("claim") && flag.room == creep.room) {
                    var path = creep.pos.findPathTo(flag, {ignoreCreeps: true});

                    var shortDistance = intentsUtil.getShortDistanceFactor(path, this.range);
                    var importance = 0.5 + shortDistance * 0.1;

                    result.push(
                        {
                            importance: importance,
                            path: path,
                            choose: function() {
                                creep.memory.intent = "moveToClaimableRoom";
                                moveAction.start(creep, this.path, thisIntent.range);
                            }
                        });
                }
            });

        return result;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            intentsUtil.reset(creep);
        }
    }
};
var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "moveToClaimableRoom",
    range: 0,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE, CLAIM);
    },
    listPossibilities: function(creep) {
        var result = [];

        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("claim") && flag.room == creep.room) {
                    result.push(new Possibility({
                        creep: creep,
                        intent: this,
                        roomObject: flag,
                        shortDistanceFactor: 0.1,
                        baseImportance: 0.5
                    }));
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
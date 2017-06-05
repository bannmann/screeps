var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");

module.exports = {
    name: "pioneer",
    range: 5,
    canBePerformedBy: function(creep) {
        return creep.memory.race == "pioneer" && creep.hasActiveBodyparts(MOVE);
    },
    listPossibilities: function(creep) {
        var result = [];

        var room = Game.rooms[creep.memory.pioneeringRoomName];
        if (room && room.my) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: room.controller,
                baseImportance: 0.9
            }));
        }

        return result;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            creep.memory.race = "worker";
            intentsUtil.reset(creep);
        }
    }
};
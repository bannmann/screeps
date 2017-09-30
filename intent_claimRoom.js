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

        var chosenDistance = Number.MAX_VALUE;
        var chosenFlag = null;
        _.each(Game.flags,
            (flag)=> {
                if (flag.name.startsWith("claim")) {
                    var distance = creep.pos.getApproximateRangeTo(flag.pos);
                    if (distance < chosenDistance) {
                        chosenDistance = distance;
                        chosenFlag = flag;
                    }
                }
            });

        if (chosenFlag) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: chosenFlag,
                baseImportance: 0.5,
                intentStatus: {
                    flagName: chosenFlag.name
                }
            }));
        }

        return result;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else if (creep.room.claimable) {
            var target = creep.room.controller;
            if (creep.pos.inRangeTo(target.pos, 1)) {
                if (this.gclAllowsClaiming()) {
                    this.claimRoom(creep);
                } else {
                    Game.notify("Waiting for free GCL in order to claim room " + creep.pos.roomName);
                }
            } else {
                moveAction.start(creep, 1, target.pos);
            }
        } else {
            creep.logInfo("non-claimable room encountered, resetting");
            intentsUtil.reset(creep);
        }
    },
    gclAllowsClaiming: function() {
        var claimedRooms = _.filter(Game.rooms, (room) => room.claimed).length;
        return Game.gcl.level > claimedRooms;
    },
    claimRoom: function(creep) {
        var claimResult = creep.claimController(creep.room.controller);
        if (claimResult == OK) {
            Game.notify("Room " + creep.pos.roomName + " was claimed.");
            Game.flags[creep.memory.intentStatus.flagName].remove();
        }
        intentsUtil.finish(creep, this, claimResult);
    }
};
require('util_profiler').registerModule(module);
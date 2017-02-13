var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var Possibility = require("possibility");
var Objects = require("util_objects");

module.exports = {
    name: "signController",
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.hasActiveBodyparts(MOVE);
    },
    listPossibilities: function(creep) {
        var result = [];

        var controller = creep.room.controller;
        if (this.isSigningEnabled() && controller && this.needsSigning(controller)) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: controller,
                shortDistanceFactor: 0,
                baseImportance: 0.1
            }));
        }

        return result;
    },
    isSigningEnabled: function() {
        return typeof(Memory.ROOM_SIGNATURE) != "undefined";
    },
    needsSigning: function(controller) {
        return this.shouldApplySign(controller) || this.shouldRemoveSign(controller);
    },
    shouldApplySign: function(controller) {
        var sign = Objects.loadPath(controller, ["sign"], "text") || "";
        return sign != Memory.ROOM_SIGNATURE;
    },
    shouldRemoveSign: function(controller) {
        return Memory.ROOM_SIGNATURE == "" && controller.sign;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            creep.signController(creep.room.controller, Memory.ROOM_SIGNATURE);
            intentsUtil.reset(creep);
        }
    }
};
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

        var room = creep.room;
        if (this.isSigningEnabled() && (this.shouldApplySign(room) || this.shouldRemoveSign(room))) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: room.controller,
                shortDistanceFactor: 0,
                baseImportance: 0.1
            }));
        }

        return result;
    },
    isSigningEnabled: function() {
        return typeof(Memory.ROOM_SIGNATURE) != "undefined";
    },
    shouldApplySign: function(room) {
        return room.my && this.getSign(room) != Memory.ROOM_SIGNATURE;
    },
    getSign: function(room) {
        return Objects.loadPath(room, ["controller", "sign"], "text") || "";
    },
    shouldRemoveSign: function(room) {
        return room.controller && room.controller.sign && (room.neutral || room.my && Memory.ROOM_SIGNATURE == "");
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            var room = creep.room;
            var signature = Memory.ROOM_SIGNATURE;
            if (room.neutral) {
                signature = "";
            }
            var signResult = creep.signController(room.controller, signature);
            intentsUtil.finish(creep, this, signResult);
        }
    }
};
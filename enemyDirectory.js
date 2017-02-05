var logger = require("logger");
var Objects = require("util_objects");

var data = {};

module.exports = {
    onTickStarting: function() {
        _.each(Game.rooms, (room) => {
            var roomData = Objects.loadPath(Memory, ["EnemyDirectory", "rooms"], room.name) || {};

            var target = null;
            _.each(
                room.find(FIND_HOSTILE_CREEPS), (enemy) => {
                    if (!target || enemy.canHeal && !target.canHeal || enemy.hits < target.hits) {
                        target = enemy;
                    }
                });
            if (target) {
                roomData.targetCreepId = target.id;
                roomData.tickLastContact = Game.time;
            } else {
                roomData.targetCreepId = null;
            }
            roomData.tickLastScan = Game.time;

            Objects.savePath(Memory, ["EnemyDirectory", "rooms"], room.name, roomData);
        });
    },

    getTarget: function(room) {
        var result = null;

        var targetCreepId = Objects.loadPath(Memory, ["EnemyDirectory", "rooms", room.name], "targetCreepId");
        if (targetCreepId) {
            result = Game.getObjectById(targetCreepId);
        }

        return result;
    },

    getTicksSinceLastContact: function(room) {
        var result = Number.MAX_VALUE;
        var tickLastContact = Objects.loadPath(Memory, ["EnemyDirectory", "rooms", room.name], "tickLastContact");
        if (tickLastContact) {
            result = Game.time - tickLastContact;
        }
        return result;
    }
};
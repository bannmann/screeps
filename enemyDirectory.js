var logger = require("logger");
var Objects = require("util_objects");
var playerDirectory = require("playerDirectory");

module.exports = {
    onTickStarting: function() {
        _.each(Game.rooms, (room) => {
            var roomData = Objects.loadPath(Memory, ["EnemyDirectory", "rooms"], room.name) || {};
            roomData.enemyCount = 0;

            var target = null;
            _.each(
                room.find(FIND_HOSTILE_CREEPS), (creep) => {
                    if (this.shouldAttack(creep)) {
                        roomData.enemyCount++;
                        if (!target || creep.canHeal && !target.canHeal || creep.hits < target.hits) {
                            target = creep;
                        }
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

    shouldAttack: function(creepOrStructure) {
        return this.isOwned(creepOrStructure) && !creepOrStructure.my &&
            playerDirectory.isEnemy(creepOrStructure.owner.username);
    },

    isOwned: function(something) {
        return something instanceof Creep || something instanceof OwnedStructure;
    },

    enemiesPresent: function(room) {
        return this.getEnemyCount(room) > 0;
    },

    getEnemyCount: function(room) {
        return this.getRoomProperty(room, "enemyCount");
    },

    getTarget: function(room) {
        var result = null;

        var targetCreepId = this.getRoomProperty(room, "targetCreepId");
        if (targetCreepId) {
            result = Game.getObjectById(targetCreepId);
        }

        return result;
    },

    getTicksSinceLastContact: function(room) {
        var result = Number.MAX_VALUE;
        var tickLastContact = this.getRoomProperty(room, "tickLastContact");
        if (tickLastContact) {
            result = Game.time - tickLastContact;
        }
        return result;
    },

    getRoomProperty: function(room, propertyName) {
        return Objects.loadPath(Memory, ["EnemyDirectory", "rooms", room.name], propertyName);
    }
};
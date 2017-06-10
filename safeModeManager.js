var enemyDirectory = require("enemyDirectory");

module.exports = {
    manage: function() {
        _.each(
            Game.rooms, (room) => {
                if (this.shouldActivate(room)) {
                    this.activate(room);
                }
            });
    },

    shouldActivate: function(room) {
        return room.claimed && enemyDirectory.enemiesPresent(room) && this.isDefenseless(room) && this.canActivate(room);
    },

    isDefenseless: function(room) {
        if (room.controller.level < 3) {
            return true;
        } else {
            var towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
            return towers.length == 0 || _.every(towers, (tower) => tower.energy < 10);
        }
    },

    canActivate: function(room) {
        var controller = room.controller;
        return !controller.safeMode && !controller.safeModeCooldown && controller.safeModeAvailable > 0;
    },

    activate: function(room) {
        Game.notify("Activating safe mode for room " + room.name);
        room.controller.activateSafeMode();
    }
};
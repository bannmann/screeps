var enemyDirectory = require("enemyDirectory");

module.exports = {
    manage: function() {
        _.each(
            Game.rooms, (room) => {
                if (this.shouldActivate(room)) {
                    room.controller.activateSafeMode();
                }
            });
    },

    shouldActivate: function(room) {
        var controller = room.controller;
        return enemyDirectory.enemiesPresent(room) && controller && controller.my && this.canActivate(controller);
    },

    canActivate: function(controller) {
        return !controller.safeMode && !controller.safeModeCooldown && controller.safeModeAvailable > 0;
    }
};
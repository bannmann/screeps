module.exports.manage = function() {
    _.each(Game.rooms, (room) => {
        var controller = room.controller;
        if (controller &&
            controller.my &&
            !controller.safeMode &&
            !controller.safeModeCooldown &&
            controller.safeModeAvailable >
            0 &&
            room.find(FIND_HOSTILE_CREEPS).length >
            0) {
            controller.activateSafeMode();
        }
    });
};
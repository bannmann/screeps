module.exports.manage = function() {
    for (var name in Game.rooms) {
        var room = Game.rooms[name];
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
    }
};
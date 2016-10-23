const ACCEPTABLE_PAUSE = 2;
const ACCEPTABLE_DETOUR_FACTOR = 2;

module.exports = {
    start: function(creep, path) {
        creep.memory.movementStatus = {
            pauseDuration: 0,
            lastPosition: null,
            path: Room.serializePath(path)
        };
    },
    isActive: function(creep) {
        return creep.memory.movementStatus != undefined;
    },
    perform: function(creep, intent) {
        var target = Game.getObjectById(creep.memory.target);
        var status = creep.memory.movementStatus;

        var currentPosition = creep.pos.x + "-" + creep.pos.y;
        if (currentPosition == status.lastPosition) {
            status.pauseDuration++;
        } else {
            status.pauseDuration = 0;
        }

        if (status.pauseDuration >= ACCEPTABLE_PAUSE) {
            var optimalPath = creep.pos.findPathTo(target, {ignoreCreeps: true});
            var creepCausedDetour = creep.pos.findPathTo(target, {ignoreCreeps: false});

            if (creepCausedDetour.length < optimalPath.length * ACCEPTABLE_DETOUR_FACTOR) {
                status.path = Room.serializePath(creepCausedDetour);
            } else {

            }
        }

        creep.moveByPath(status.path);
        if (creep.pos.getRangeTo(target) <= intent.range) {
            this.stop(creep);
        }

        status.lastPosition = currentPosition;
    },
    stop: function(creep) {
        delete creep.memory.movementStatus;
    }
};
const TICKS_TO_DOWNGRADE_THRESHOLD = 100;

var moveAction = require("action_move");

module.exports = {
    range: 3,
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(WORK) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy >
            0;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            if (structure.structureType == STRUCTURE_CONTROLLER) {
                var path = creep.pos.findPathTo(structure, {ignoreCreeps: true});

                var shortDistance = 1 / (path.length - this.range);

                // Increase panic level as ticksToDowngrade approaches threshold, but never surpass 1
                var panicLevel = TICKS_TO_DOWNGRADE_THRESHOLD / Math.max(structure.ticksToDowngrade, TICKS_TO_DOWNGRADE_THRESHOLD);

                // Usually, this intent is unimportant, but when it panics, it's very, very important
                var importance = 0.1 + shortDistance * 0.1 + panicLevel * 0.7;

                result.push(
                    {
                        importance: importance,
                        target: structure,
                        path: path,
                        choose: function() {
                            creep.memory.intent = "transferToController";
                            creep.memory.target = this.target.id;

                            moveAction.start(creep, this.path);
                        }
                    });
            }
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.carry.energy == 0) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            creep.upgradeController(target);
        }
    }
};
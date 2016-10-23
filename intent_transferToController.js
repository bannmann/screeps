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

                var importance = Math.min(path.length - this.range + 1, structure.ticksToDowngrade) /
                    structure.ticksToDowngrade;

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
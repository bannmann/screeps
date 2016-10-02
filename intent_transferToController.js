module.exports = {
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(WORK) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy >
            0;
    }, listPossibilities: function(creep) {
        var result = [];
        for (var structureId in Game.structures) {
            var structure = Game.structures[structureId];
            if (structure.structureType == STRUCTURE_CONTROLLER) {
                var path = creep.pos.findPathTo(structure, {ignoreCreeps: true});

                var importance = Math.min(path.length + 1, structure.ticksToDowngrade) / structure.ticksToDowngrade;

                result.push(
                    {
                        importance: importance, choose: function() {
                        creep.memory.intent = "transferToController";
                        creep.memory.target = structure.id;
                        creep.memory.path = Room.serializePath(path);
                    }
                    });
            }
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            creep.moveByPath(creep.memory.path);
            if (creep.pos.getRangeTo(target) <= 3) {
                delete creep.memory.path;
            }
        }
        else {
            creep.upgradeController(target);
            if (creep.carry.energy == 0) {
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
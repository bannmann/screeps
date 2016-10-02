module.exports = {
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(WORK) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy <
            creep.carryCapacity;
    }, listPossibilities: function(creep) {
        var result = [];
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var sources = room.find(FIND_SOURCES);
            sources.forEach(
                (source)=> {
                    var path = creep.pos.findPathTo(source, {ignoreCreeps: true});

                    var importance = source.energy / source.energyCapacity;

                    result.push(
                        {
                            importance: importance, choose: function() {
                            creep.memory.intent = "harvestEnergy";
                            creep.memory.target = source.id;
                            creep.memory.path = Room.serializePath(path);
                        }
                        });
                });
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            creep.moveByPath(creep.memory.path);
            if (creep.pos.getRangeTo(target) <= 1) {
                delete creep.memory.path;
            }
        }
        else {
            creep.harvest(target);
            if (creep.carry.energy == creep.carryCapacity) {
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
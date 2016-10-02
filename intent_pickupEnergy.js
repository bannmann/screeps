module.exports = {
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy <
            creep.carryCapacity;
    }, listPossibilities: function(creep) {
        var result = [];
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var droppedEnergies = room.find(FIND_DROPPED_ENERGY);
            droppedEnergies.forEach(
                (droppedEnergy) => {
                    var path = creep.pos.findPathTo(droppedEnergy, {ignoreCreeps: true});

                    var freeCapacity = creep.carryCapacity - creep.carry.energy;
                    var importance = Math.min(droppedEnergy.energy, freeCapacity) / freeCapacity;

                    result.push(
                        {
                            importance: importance, choose: function() {
                            creep.memory.intent = "pickupEnergy";
                            creep.memory.target = droppedEnergy.id;
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
            creep.pickup(target);
            if (!target || creep.carry.energy == creep.carryCapacity) {
                delete creep.memory.intent;
                delete creep.memory.target;
            }
        }
    }
};
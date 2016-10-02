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
                            importance: importance,
                            target: droppedEnergy.id,
                            path: Room.serializePath(path),
                            choose: function() {
                                creep.memory.intent = "pickupEnergy";
                                creep.memory.target = this.target;
                                creep.memory.path = this.path;
                            }
                        });
                });
        }
        return result;
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.memory.path) {
            if (creep.moveByPath(creep.memory.path) != OK) {
                creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
            }
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
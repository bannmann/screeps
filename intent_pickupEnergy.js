module.exports = {
    range: 1,
    canBePerformedBy: function(creep) {
        return creep.getActiveBodyparts(MOVE) >
            0 &&
            creep.getActiveBodyparts(CARRY) >
            0 &&
            creep.carry.energy <
            creep.carryCapacity;
    },
    listPossibilities: function(creep) {
        var result = [];
        for (var roomId in Game.rooms) {
            var room = Game.rooms[roomId];
            var droppedEnergies = room.find(FIND_DROPPED_ENERGY);
            droppedEnergies.forEach(
                (droppedEnergy) => {
                    var path = creep.pos.findPathTo(droppedEnergy, {ignoreCreeps: true});

                    var freeCapacity = creep.carryCapacity - creep.carry.energy;
                    var importance = (
                        Math.min(droppedEnergy.energy, freeCapacity) / freeCapacity) * (
                        1 / (
                        path.length - this.range));

                    result.push(
                        {
                            importance: importance,
                            target: droppedEnergy,
                            path: path,
                            choose: function() {
                                creep.memory.intent = "pickupEnergy";
                                creep.memory.target = this.target.id;
                                creep.memory.path = Room.serializePath(this.path);
                            }
                        });
                });
        }
        return result;
    },
    pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (!target || creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
        else if (creep.memory.path) {
            if (creep.moveByPath(creep.memory.path) != OK) {
                creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
            }
            if (creep.pos.getRangeTo(target) <= this.range) {
                delete creep.memory.path;
            }
        }
        else {
            creep.pickup(target);
        }
    }
};
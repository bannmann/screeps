var moveAction = require("action_move");

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

                                moveAction.start(creep, this.path);
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
        else if (moveAction.isActive(creep)) {
            moveAction.perform(creep, this);
        }
        else {
            creep.pickup(target);
        }
    }
};
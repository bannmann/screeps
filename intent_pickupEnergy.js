module.exports = {
    name: "pickupEnergy", ponder: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            var target = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
            if (target) {
                creep.memory.intent = this.name;
                creep.memory.target = target.id;
            }
        }
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        if (!target || creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
    }
};
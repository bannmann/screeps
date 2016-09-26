module.exports = {
    name: "harvestEnergy", ponder: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            var target = creep.pos.findClosestByPath(FIND_SOURCES);
            if (target) {
                creep.memory.intent = this.name;
                creep.memory.target = target.id;
            }
        }
    }, pursue: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        if (creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.intent;
            delete creep.memory.target;
        }
    }
};
module.exports = {
    range: 1, canBePerformedBy: function(creep) {
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

                    var importance = (
                        source.energy / source.energyCapacity) * (
                        1 / (
                        path.length - this.range));

                    result.push(
                        {
                            importance: importance,
                            target: source.id,
                            path: Room.serializePath(path),
                            choose: function() {
                                creep.memory.intent = "harvestEnergy";
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
            if (creep.pos.getRangeTo(target) <= this.range) {
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
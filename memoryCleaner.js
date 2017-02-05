module.exports.clean = function() {
    _.each(Memory.creeps, (creepMemory, name) => {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    });

    if (Game.time % 100 == 0) {
        // See also prototype_memory
        _.each(["extensions", "towers", "ramparts", "walls"], (blockName) => {
            var entries = Memory[blockName];
            _.eachRight(entries, (entry, id) => {
                if (Game.getObjectById(id) == null) {
                    delete entries[id];
                }
            });
        });
    }

};
module.exports = {
    /**
     * Accesses the Memory object so that its deserialization overhead is profiled in one deterministic location.
     */
    init: function() {
        Object.keys(Memory)[0];
    },
    clean: function() {
        _.each(
            Memory.creeps, (creepMemory, name) => {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            });

        if (Game.time % 100 == 0) {
            // See also prototype_memory
            _.each(
                ["extensions", "towers", "ramparts", "walls", "containers", "tombstones", "resources", "storages"],
                (blockName) => {
                    var entries = Memory[blockName];
                    _.eachRight(
                        entries, (entry, id) => {
                            if (Game.getObjectById(id) == null) {
                                delete entries[id];
                            }
                        });
                });
        }
    }
};
require('util_profiler').registerModule(module);
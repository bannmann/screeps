var _ = require("lodash");

module.exports.apply = function() {
    function apply(proto, memoryName) {
        if (_.isUndefined(Memory[memoryName])) {
            Memory[memoryName] = {};
        }

        if (!proto.hasOwnProperty("memory")) {
            Object.defineProperty(
                proto, "memory", {
                    get: function() {
                        return Memory[memoryName][this.id] = Memory[memoryName][this.id] || {};
                    },
                    set: function(value) {
                        Memory[memoryName][this.id] = value;
                    }
                });
        }
    }

    // See also memoryManager
    apply(StructureExtension.prototype, "extensions");
    apply(StructureTower.prototype, "towers");
    apply(StructureStorage.prototype, "storages");
    apply(StructureRampart.prototype, "ramparts");
    apply(StructureWall.prototype, "walls");
    apply(StructureContainer.prototype, "containers");
    apply(Tombstone.prototype, "tombstones");
    apply(Resource.prototype, "resources");
};
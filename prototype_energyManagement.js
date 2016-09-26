var _ = require("lodash");

module.exports.apply = function() {
    function addEnergyManagement(proto, memoryName) {
        if (!proto.hasOwnProperty("memory")) {
            Object.defineProperty(
                proto, "memory", {
                    get: function() {
                        if (_.isUndefined(Memory[memoryName])) {
                            Memory[memoryName] = {};
                        }
                        if (!_.isObject(Memory[memoryName])) {
                            return undefined;
                        }
                        return Memory[memoryName][this.id] = Memory[memoryName][this.id] || {};
                    }, set: function(value) {
                        if (_.isUndefined(Memory[memoryName])) {
                            Memory[memoryName] = {};
                        }
                        if (!_.isObject(Memory[memoryName])) {
                            throw new Error("Could not set " + memoryName + " memory");
                        }
                        Memory[memoryName][this.id] = value;
                    }
                });
        }

        proto.needsEnergy = function() {
            return this.energy + this.calculateExpectedEnergy() < this.energyCapacity;
        };
        proto.registerDelivery = function(creep) {
            if (!this.memory.incomingDeliveries) {
                this.memory.incomingDeliveries = {};
            }
            this.memory.incomingDeliveries[creep.id] = creep.carry.energy;
        };
        proto.deregisterDelivery = function(creep) {
            if (!this.memory.incomingDeliveries) {
                this.memory.incomingDeliveries = {};
            }
            delete this.memory.incomingDeliveries[creep.id];
        };
        proto.calculateExpectedEnergy = function() {
            if (!this.memory.incomingDeliveries) {
                this.memory.incomingDeliveries = {};
            }
            var expectedEnergy = 0;
            for (var creepId in this.memory.incomingDeliveries) {
                var creep = Game.getObjectById(creepId);
                if (creep) {
                    expectedEnergy += this.memory.incomingDeliveries[creepId];
                }
                else {
                    delete this.memory.incomingDeliveries[creepId];
                }
            }
            return expectedEnergy;
        };
    }

    addEnergyManagement(StructureExtension.prototype, "extensions");
    addEnergyManagement(StructureSpawn.prototype);
    addEnergyManagement(StructureTower.prototype, "towers");
};
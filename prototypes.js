module.exports = function() {
    function addEnergyManagement(prototype) {
        prototype.needsEnergy = function() {
            return this.energy + this.calculateExpectedEnergy() < this.energyCapacity;
        };
        prototype.registerDelivery = function(creep) {
            if (!this.memory.incomingDeliveries) {
                this.memory.incomingDeliveries = {};
            }
            this.memory.incomingDeliveries[creep.id] = creep.carry.energy;
        };
        prototype.deregisterDelivery = function(creep) {
            if (!this.memory.incomingDeliveries) {
                this.memory.incomingDeliveries = {};
            }
            delete this.memory.incomingDeliveries[creep.id];
        };
        prototype.calculateExpectedEnergy = function() {
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

    Object.defineProperty(
        StructureExtension.prototype, 'memory', {
            get: function() {
                if (_.isUndefined(Memory.extensions)) {
                    Memory.extensions = {};
                }
                if (!_.isObject(Memory.extensions)) {
                    return undefined;
                }
                return Memory.extensions[this.id] = Memory.extensions[this.id] || {};
            }, set: function(value) {
                if (_.isUndefined(Memory.extensions)) {
                    Memory.extensions = {};
                }
                if (!_.isObject(Memory.extensions)) {
                    throw new Error('Could not set extensions memory');
                }
                Memory.extensions[this.id] = value;
            }
        });

    Object.defineProperty(
        StructureTower.prototype, 'memory', {
            get: function() {
                if (_.isUndefined(Memory.towers)) {
                    Memory.towers = {};
                }
                if (!_.isObject(Memory.towers)) {
                    return undefined;
                }
                return Memory.towers[this.id] = Memory.towers[this.id] || {};
            }, set: function(value) {
                if (_.isUndefined(Memory.towers)) {
                    Memory.towers = {};
                }
                if (!_.isObject(Memory.towers)) {
                    throw new Error('Could not set towers memory');
                }
                Memory.towers[this.id] = value;
            }
        });

    addEnergyManagement(StructureExtension.prototype);
    addEnergyManagement(StructureSpawn.prototype);
    addEnergyManagement(StructureTower.prototype);
};
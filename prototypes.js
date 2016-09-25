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

    addEnergyManagement(StructureExtension.prototype);
    addEnergyManagement(StructureSpawn.prototype);
    addEnergyManagement(StructureTower.prototype);
};
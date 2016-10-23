var _ = require("lodash");

module.exports.apply = function() {
    function apply(proto) {
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

    apply(StructureExtension.prototype);
    apply(StructureSpawn.prototype);
    apply(StructureTower.prototype);
};
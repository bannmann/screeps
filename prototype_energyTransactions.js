var _ = require("lodash");

module.exports.apply = function() {
    function apply(proto) {
        proto.initEnergyTransactionStore = function(creep, delta) {
            // Migrate data from old memory key
            if (this.memory.incomingDeliveries) {
                this.memory.energyTransactions = this.memory.incomingDeliveries;
                delete this.memory.incomingDeliveries;
            }

            if (!this.memory.energyTransactions) {
                this.memory.energyTransactions = {};
            }
        };
        proto.registerEnergyTransaction = function(creep, delta) {
            this.initEnergyTransactionStore();
            this.memory.energyTransactions[creep.id] = delta;
        };
        proto.deregisterEnergyTransaction = function(creep) {
            this.initEnergyTransactionStore();
            delete this.memory.energyTransactions[creep.id];
        };
        proto.calculateExpectedEnergyDelta = function() {
            this.initEnergyTransactionStore();
            var totalDelta = 0;
            _.each(this.memory.energyTransactions, (delta, creepId) => {
                var creep = Game.getObjectById(creepId);
                if (creep) {
                    totalDelta += delta;
                }
                else {
                    delete this.memory.energyTransactions[creepId];
                }
            });
            return totalDelta;
        };
    }

    apply(StructureExtension.prototype);
    apply(StructureSpawn.prototype);
    apply(StructureTower.prototype);
    apply(Creep.prototype);
};
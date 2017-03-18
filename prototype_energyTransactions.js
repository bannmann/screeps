var _ = require("lodash");
var Objects = require("util_objects");

function saveTarget(creep, id) {
    Objects.savePath(creep, ["memory", "intentStatus"], "energyTransactionTargetId", id);
}

function getTarget(creep) {
    return Objects.loadPath(creep, ["memory", "intentStatus"], "energyTransactionTargetId");
}

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
            saveTarget(creep, this.id);
        };
        proto.deregisterEnergyTransaction = function(creep) {
            this.initEnergyTransactionStore();
            delete this.memory.energyTransactions[creep.id];
            saveTarget(creep, null);
        };
        proto.calculateExpectedEnergyDelta = function() {
            this.initEnergyTransactionStore();
            var totalDelta = 0;
            _.each(this.memory.energyTransactions, (delta, creepId) => {
                var creep = Game.getObjectById(creepId);
                if (creep && getTarget(creep) == this.id) {
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
    apply(StructureContainer.prototype);
    apply(Resource.prototype);
    apply(Creep.prototype);
};
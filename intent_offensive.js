const MAX_DISTANCE_TO_FLAG = 3;

var moveAction = require("action_move");
var intentsUtil = require("util_intents");
var armyManager = require("armyManager");
var Possibility = require("possibility");

module.exports = {
    name: "offensive",
    range: MAX_DISTANCE_TO_FLAG,
    canBePerformedBy: function(creep) {
        return creep.memory.race == "attacker" && creep.hasActiveBodyparts(MOVE);
    }, listPossibilities: function(creep) {
        var result = [];

        var alreadyDeployed = armyManager.isDeployed(creep);

        var newCreepShouldDeploy = !alreadyDeployed && armyManager.shouldDeployCreeps;
        var deployedCreepShouldReturn = alreadyDeployed && this.isMovementNeeded(creep);

        if (newCreepShouldDeploy || deployedCreepShouldReturn) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: armyManager.targetFlag,
                shortDistanceFactor: 0.1,
                baseImportance: 0.5,
                preparationFunction: function() {
                    if (!alreadyDeployed) {
                        armyManager.markDeployed(creep);
                    }
                }
            }));
        }

        return result;
    }, isMovementNeeded: function(creep) {
        return creep.pos.getRangeTo(armyManager.targetFlag) > MAX_DISTANCE_TO_FLAG;
    },
    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            intentsUtil.reset(creep);
        }
    }
};
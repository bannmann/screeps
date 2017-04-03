const MAX_DISTANCE_TO_FLAG = 3;
const GATHERING = "GATHERING"

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

        var isDeployed = armyManager.isDeployed(creep);
        var isReady = armyManager.isReady(creep);

        if (!isReady && !isDeployed) {
            result.push(new Possibility({
                creep: creep,
                intent: this,
                roomObject: armyManager.getGatheringFlag(),
                shortDistanceFactor: 0.1,
                baseImportance: 0.5,
                intentStatus: GATHERING
            }));
        } else {
            var newCreepShouldDeploy = isReady && armyManager.shouldDeployCreeps();
            var deployedCreepShouldReturn = isDeployed && this.isTooFarFromFlag(creep);

            if (newCreepShouldDeploy || deployedCreepShouldReturn) {
                result.push(new Possibility({
                    creep: creep,
                    intent: this,
                    roomObject: armyManager.getTargetFlag(),
                    shortDistanceFactor: 0.1,
                    baseImportance: 0.5,
                    preparationFunction: function() {
                        if (!isDeployed) {
                            armyManager.markDeployed(creep);
                        }
                    }
                }));
            }
        }

        return result;
    },

    isTooFarFromFlag: function(creep) {
        return creep.pos.getRangeTo(armyManager.getTargetFlag()) > MAX_DISTANCE_TO_FLAG;
    },

    pursue: function(creep) {
        if (moveAction.isActive(creep)) {
            moveAction.perform(creep);
        }
        else {
            if (creep.memory.intentStatus == GATHERING) {
                armyManager.markReady(creep);
            }
            intentsUtil.reset(creep);
        }
    }
};
const INTENT_NAMES = [
    "build",
    "chargeController",
    "chargeSpawn",
    "chargeTower",
    "claimRoom",
    "guidedScouting",
    "harvestEnergy",
    "idleNonWorker",
    "idleWorker",
    "meleeAttack",
    "moveToClaimableRoom",
    "offensive",
    "pickupEnergy",
    "rangedAttack",
    "signController"
];

module.exports = {
};

_.each(INTENT_NAMES, (intentName) => {
    module.exports[intentName] = require("intent_" + intentName);
});
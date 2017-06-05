const INTENT_NAMES = [
    "build",
    "chargeController",
    "chargeSpawn",
    "chargeTower",
    "claimRoom",
    "depleteContainer",
    "depleteStorage",
    "dismantle",
    "guidedScouting",
    "harvestEnergy",
    "idle",
    "meleeAttack",
    "offensive",
    "pickupEnergy",
    "pioneer",
    "rangedAttack",
    "signController"
];

module.exports = {
};

_.each(INTENT_NAMES, (intentName) => {
    module.exports[intentName] = require("intent_" + intentName);
});
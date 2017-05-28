const PROTOTYPE_NAMES = [
    "creepBody",
    "creepCarry",
    "creepDebug",
    "creepGroup",
    "creepLifeTime",
    "energyTransactions",
    "gameUserName",
    "memory",
    "roomOwnership",
    "roomPositionDirection",
    "roomPositionObstacle",
    "roomPositionRampart",
    "roomPositionRange"
];

module.exports = [];

_.each(PROTOTYPE_NAMES, (prototypeName) => {
    module.exports.push(require("prototype_" + prototypeName));
});

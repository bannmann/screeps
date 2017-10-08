const PROTOTYPE_NAMES = [
    "language", // needs to stay at position 0
    "creepBody",
    "creepCarry",
    "creepDebug",
    "creepGroup",
    "creepLifeTime",
    "energyTransactions",
    "gameUserName",
    "memory",
    "roomOwnership",
    "roomStructures",
    "roomPositionDirection",
    "roomPositionObstacle",
    "roomPositionRampart",
    "roomPositionRange"
];

module.exports = [];

_.each(PROTOTYPE_NAMES, (prototypeName) => {
    module.exports.push(require("prototype_" + prototypeName));
});

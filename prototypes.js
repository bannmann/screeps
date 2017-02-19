const PROTOTYPE_NAMES = [
    "creepBody",
    "creepDebug",
    "creepGroup",
    "energyTransactions",
    "gameUserName",
    "memory",
    "roomOwnership",
    "roomPositionDirection",
    "roomPositionObstacle"
];

module.exports = [];

_.each(PROTOTYPE_NAMES, (prototypeName) => {
    module.exports.push(require("prototype_" + prototypeName));
});

const PROTOTYPE_NAMES = [
    "creepBody",
    "creepDebug",
    "creepGroup",
    "energyManagement",
    "gameUserName",
    "memory",
    "roomOwnership"
];

module.exports = [];

_.each(PROTOTYPE_NAMES, (prototypeName) => {
    module.exports.push(require("prototype_" + prototypeName));
});

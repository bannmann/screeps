const PROTOTYPE_NAMES = [
    "creepBody",
    "creepDebug",
    "creepGroup",
    "energyManagement",
    "gameUserName",
    "memory"
];

module.exports = [];

_.each(PROTOTYPE_NAMES, (prototypeName) => {
    module.exports.push(require("prototype_" + prototypeName));
});

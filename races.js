const RACE_NAMES = [
    "attacker",
    "claimer",
    "dismantler",
    "defender",
    "pioneer",
    "scout",
    "worker"
];

module.exports = {
};

_.each(RACE_NAMES, (raceName) => {
    module.exports[raceName] = require("race_" + raceName);
});

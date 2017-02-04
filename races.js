const RACE_NAMES = [
    "attacker",
    "claimer",
    "defender",
    "scout",
    "worker"
];

module.exports = {
};

_.each(RACE_NAMES, (raceName) => {
    module.exports[raceName] = require("race_" + raceName);
});

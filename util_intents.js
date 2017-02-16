module.exports = {
    getShortDistanceFactor: function(path, range) {
        return 1 / Math.max(1, path.length - range);
    },
    reset: function(creep) {
        delete creep.memory.intent;
        delete creep.memory.target;
        delete creep.memory.movementStatus;
        creep.logDebug("reset");
    },
    isCreepSuitableForIntent: function(creep, intentName) {
        var result = true;
        var whitelist = creep.memory.intentWhitelist;
        if (whitelist) {
            result = _.indexOf(whitelist, intentName) >= 0;
            creep.logDebug("has whitelist, result for " + intentName + ": " + result);
        }
        return result;
    }
};
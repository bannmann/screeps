module.exports = {
    finish: function(creep, intent, functionResult) {
        var result;
        if (functionResult == OK) {
            this.reset(creep);
            result = true;
        }
        else {
            this.abort(creep, intent, "finish result " + functionResult);
            result = false;
        }
        return result;
    },
    abort: function(creep, intent, reason) {
        creep.logDebug("aborting " + intent.name + " due to " + reason);
        this.doReset(creep);
    },
    reset: function(creep) {
        creep.logDebug("reset");
        this.doReset(creep);
    },
    doReset: function(creep) {
        delete creep.memory.intent;
        delete creep.memory.target;
        delete creep.memory.movementStatus;
        delete creep.memory.intentStatus;
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
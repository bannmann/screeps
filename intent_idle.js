module.exports = {
    canBePerformedBy: function(creep) {
        return true;
    }, listPossibilities: function(creep) {
        var result = [];
        result.push(
            {
                importance: 0, choose: function() {
                creep.memory.intent = "idle";
            }
            });
        return result;
    }, pursue: function(creep) {
        creep.say("Zzzzzz....");
        delete creep.memory.intent;
    }
};
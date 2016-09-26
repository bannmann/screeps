module.exports = {
    name: "idle", ponder: function(creep) {
        creep.memory.intent = this.name;
    }, pursue: function(creep) {
        creep.say("Zzzzzz....");
        delete creep.memory.intent;
    }
};
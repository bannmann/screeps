module.exports.clean = function() {
    _.each(Memory.creeps, (creepMemory, name) => {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    });
};
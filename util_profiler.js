var profiler = require('screeps-profiler');

module.exports = {
    registerModule: function(module) {
        profiler.registerObject(module.exports, module.name);
    }
};
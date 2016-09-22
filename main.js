var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");

module.exports.loop = function() {
    memoryCleaner.clean();
    intentManager.processIntents();
    spawnManager.spawnCreepIfNecessary();
};
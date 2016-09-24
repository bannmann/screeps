require("prototypes")();
var safeModeManager = require("safeModeManager");
var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");

module.exports.loop = function() {
    safeModeManager.manage();
    memoryCleaner.clean();
    intentManager.processIntents();
    spawnManager.spawnCreepIfNecessary();
};
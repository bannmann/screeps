require("prototypeManager").applyPrototypes();

var moveAction = require("action_move");
var safeModeManager = require("safeModeManager");
var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");

module.exports.loop = function() {
    safeModeManager.manage();
    memoryCleaner.clean();
    intentManager.processIntents();

    spawnManager.spawnCreepIfNecessary();

    moveAction.savePauseStats();
    spawnManager.saveIdleCreepCount();
};
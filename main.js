require("prototypeManager").applyPrototypes();

var moveAction = require("action_move");
var safeModeManager = require("safeModeManager");
var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");
var towerManager = require("towerManager");
var constructionManager = require("constructionManager");

module.exports.loop = function() {
    safeModeManager.manage();
    memoryCleaner.clean();

    towerManager.manage();

    constructionManager.manage();
    intentManager.processIntents();
    spawnManager.spawnCreepIfNecessary();

    moveAction.savePauseStats();
    spawnManager.saveIdleCreepCount();
};
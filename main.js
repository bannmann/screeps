require("prototypeManager").applyPrototypes();

var moveAction = require("action_move");
var safeModeManager = require("safeModeManager");
var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");
var towerManager = require("towerManager");
var constructionManager = require("constructionManager");
var armyManager = require("armyManager");
var workerRace = require("race_worker");
var logger = require("logger");
var creepDirectory = require("creepDirectory");

module.exports.loop = function() {
    PathFinder.use(true);

    safeModeManager.manage();
    memoryCleaner.clean();

    armyManager.initialize();
    workerRace.onTickStarting();
    creepDirectory.onTickStarting();

    towerManager.manage();

    constructionManager.manage();
    intentManager.processIntents();
    spawnManager.spawnCreepIfNecessary();

    moveAction.savePauseStats();

    workerRace.onTickEnding();
    creepDirectory.onTickEnding();
};
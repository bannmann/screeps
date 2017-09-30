require("prototypeManager").applyPrototypes();
const profiler = require('screeps-profiler');

var safeModeManager = require("safeModeManager");
var memoryCleaner = require("memoryCleaner");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");
var towerManager = require("towerManager");
var constructionManager = require("constructionManager");
var armyManager = require("armyManager");
var logger = require("logger");
var listeners = require("listeners");

profiler.enable();
module.exports.loop = function() {
    profiler.wrap(function() {
        PathFinder.use(true);

        safeModeManager.manage();
        memoryCleaner.clean();

        listeners.fireTickStarting();

        armyManager.initialize();
        towerManager.manage();
        constructionManager.manage();
        intentManager.processIntents();
        spawnManager.spawnCreepIfNecessary();

        listeners.fireTickEnding();
    });
};
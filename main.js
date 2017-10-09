require("prototypeManager").applyPrototypes();
const profiler = require('screeps-profiler');

var safeModeManager = require("safeModeManager");
var memoryManager = require("memoryManager");
var intentManager = require("intentManager");
var spawnManager = require("spawnManager");
var towerManager = require("towerManager");
var constructionManager = require("constructionManager");
var armyManager = require("armyManager");
var logger = require("logger");
var listeners = require("listeners");
var timeoutManager = require("timeoutManager");

profiler.enable();
module.exports.loop = function() {
    profiler.wrap(function() {
        memoryManager.init();
        timeoutManager.start();

        safeModeManager.manage();
        memoryManager.clean();

        listeners.fireTickStarting();

        armyManager.initialize();
        towerManager.manage();
        constructionManager.manage();
        intentManager.processIntents();
        spawnManager.spawnCreepIfNecessary();

        listeners.fireTickEnding();
        timeoutManager.stop();
    });
};
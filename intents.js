var pickupEnergy = require("intent_pickupEnergy");
var build = require("intent_build");
var harvestEnergy = require("intent_harvestEnergy");
var transferToMyStructure = require("intent_transferToMyStructure");
var transferToController = require("intent_transferToController");
var rangedAttack = require("intent_rangedAttack");
var idle = require("intent_idle");

module.exports = {
    transferToMyStructure: transferToMyStructure,
    pickupEnergy: pickupEnergy,
    build: build,
    harvestEnergy: harvestEnergy,
    transferToController: transferToController,
    rangedAttack: rangedAttack,
    idle: idle
};
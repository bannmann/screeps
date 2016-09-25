var pickupEnergy = require("pickupEnergy");
var build = require("build");
var harvestEnergy = require("harvestEnergy");
var transferToMyStructure = require("transferToMyStructure");
var transferToController = require("transferToController");
var idle = require("idle");

module.exports = {
    transferToMyStructure: transferToMyStructure,
    pickupEnergy: pickupEnergy,
    build: build,
    harvestEnergy: harvestEnergy,
    transferToController: transferToController,
    idle: idle
};
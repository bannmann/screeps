var pickupEnergy = require("intent_pickupEnergy");
var build = require("intent_build");
var harvestEnergy = require("intent_harvestEnergy");
var chargeSpawn = require("intent_chargeSpawn");
var chargeTower = require("intent_chargeTower");
var chargeController = require("intent_chargeController");
var rangedAttack = require("intent_rangedAttack");
var moveToClaimableRoom = require("intent_moveToClaimableRoom");
var claimRoom = require("intent_claimRoom");
var idleWorker = require("intent_idleWorker");
var idleNonWorker = require("intent_idleNonWorker");

module.exports = {
    chargeSpawn: chargeSpawn,
    chargeTower: chargeTower,
    pickupEnergy: pickupEnergy,
    build: build,
    harvestEnergy: harvestEnergy,
    chargeController: chargeController,
    rangedAttack: rangedAttack,
    moveToClaimableRoom: moveToClaimableRoom,
    claimRoom: claimRoom,
    idleWorker: idleWorker,
    idleNonWorker: idleNonWorker
};
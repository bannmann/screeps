var worker = require("race_worker");
var defender = require("race_defender");
var attacker = require("race_attacker");
var claimer = require("race_claimer");
var scout = require("race_scout");

module.exports = {
    worker: worker,
    defender: defender,
    attacker: attacker,
    claimer: claimer,
    scout: scout
};
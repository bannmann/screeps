var worker = require("race_worker");
var defender = require("race_defender");
var claimer = require("race_claimer");
var scout = require("race_scout");

module.exports = {
    worker: worker,
    defender: defender,
    claimer: claimer,
    scout: scout
};
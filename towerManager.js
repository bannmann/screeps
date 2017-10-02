const MINIMUM_STRENGTH = 1000;
const REINFORCEMENT_MIN_PEACE_TICKS = 100;
const REINFORCEMENT_INTERVAL = 20;
var flagDirectory = require("flagDirectory");
var enemyDirectory = require("enemyDirectory");
var Objects = require("util_objects");

var data = {};

module.exports = {
    manage: function() {
        data.defenseRepairAmounts = {};

        _.each(
            Game.rooms, (room) => {
                var enemy = enemyDirectory.getTarget(room);

                var structures = this.getStructures(room);
                var towers = this.getTowers(structures);

                var defenses = null;
                var damagedBuildings = null;
                _.each(
                    towers, (tower) => {
                        if (tower.energy >= 10) {
                            var done = false;
                            if (enemy) {
                                tower.attack(enemy);
                                done = true;
                            }
                            if (!done) {
                                if (!defenses) {
                                    defenses = this.getDefenses(structures);
                                }
                                done = this.repairDefenses(tower, defenses);
                            }
                            if (!done) {
                                done = this.healCreeps(tower);
                            }
                            if (!done) {
                                if (!damagedBuildings) {
                                    damagedBuildings = this.getDamagedBuildings(structures);
                                }
                                done = this.repairBuildings(tower, damagedBuildings);
                            }
                            if (!done) {
                                done = this.reinforceDefenses(tower, defenses);
                            }
                        }
                    });
            });
    },

    getStructures: function(room) {
        var result = [];
        _.each(Game.structures, (structure) => {
            if (structure.pos.roomName == room.name) {
                result.push(structure);
            }
        });
        return result;
    },

    getTowers: function(roomStructures) {
        var result = _.filter(roomStructures, {structureType: STRUCTURE_TOWER});
        return result;
    },

    healCreeps: function(tower) {
        var result = false;

        var creepToHeal = tower.pos.findClosestByRange(
            FIND_MY_CREEPS, {
                filter: (creep) => creep.hits < creep.hitsMax
            });
        if (creepToHeal) {
            tower.heal(creepToHeal);
            result = true;
        }

        return result;
    },

    getDefenses: function(roomStructures) {
        var result = _.filter(roomStructures, (structure) =>  this.isDefense(structure));
        return result;
    },

    /**
     * Repairs previously damaged defenses, but takes care to not reinforce them (to avoid rampart decay leading to
     * repairs which increase rampart strength way beyond wall strength).
     *
     * Also increases hit points of new defenses to MINIMUM_STRENGTH.
     */
    repairDefenses: function(tower, defenses) {
        var result = false;

        var job = null;

        var lowestHits = Number.MAX_VALUE;
        _.each(
            defenses, (defense) => {
                var defenseHits = this.getEffectiveHits(defense);
                if (defenseHits < lowestHits) {
                    var damageTaken = this.getDamageTaken(defense, defenseHits);
                    if (damageTaken > 0) {
                        var repairAmount = this.calculateRepairAmount(tower, defense);
                        // We cannot choose how much to repair, so we wait until damage equals the repair amount.
                        if (damageTaken >= repairAmount) {
                            job = {defense: defense, amount: repairAmount};
                            lowestHits = defenseHits;
                        }
                    }
                }
            });

        if (job) {
            tower.repair(job.defense);
            this.addRepairAmount(job.defense, job.amount);
            result = true;
        }

        return result;
    },

    calculateRepairAmount: function(tower, structure) {
        var result = TOWER_POWER_REPAIR;
        var range = Math.max(Math.abs(structure.pos.x - tower.pos.x), Math.abs(structure.pos.y - tower.pos.y));
        if (range > TOWER_OPTIMAL_RANGE) {
            range = Math.min(range, TOWER_FALLOFF_RANGE);
            result -=
                result * TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
            result = Math.floor(result);
        }
        return result;
    },

    getEffectiveHits: function(defense) {
        var result = defense.hits;
        var repairAmount = data.defenseRepairAmounts[defense.id];
        if (repairAmount) {
            result += repairAmount;
        }
        return result;
    },

    getDamageTaken: function(defense, defenseHits) {
        defense.memory.strength = Math.max(defense.memory.strength | 0, defenseHits, MINIMUM_STRENGTH);
        return defense.memory.strength - defenseHits;
    },

    addRepairAmount: function(defense, amount) {
        var existingAmount = data.defenseRepairAmounts[defense.id] || 0;
        data.defenseRepairAmounts[defense.id] = existingAmount + amount;
    },

    getDamagedBuildings: function(roomStructures) {
        var result = _.filter(roomStructures, (structure) => this.isRepairable(structure) && this.isDamaged(structure));
        return result;
    },

    isRepairable: function(structure) {
        return !this.isDefense(structure) && structure.structureType != STRUCTURE_ROAD;
    },

    isDamaged: function(structure) {
        return structure.hits < structure.hitsMax;
    },

    repairBuildings: function(tower, damagedBuildings) {
        var result = false;

        var chosenBuilding;
        var chosenDistance = 99;
        _.each(damagedBuildings, (structure) => {
            var distance = tower.pos.getRangeTo(structure);
            if (distance < chosenDistance) {
                chosenBuilding = structure;
                chosenDistance = distance;
            }
        });

        if (chosenBuilding) {
            // For simplicity, damagedBuildings is not updated. Multiple towers might repair the same building.
            tower.repair(chosenBuilding);
            result = true;
        }

        return result;
    },

    reinforceDefenses: function(tower, defenses) {
        var result = false;

        if (this.shouldReinforceDefenses(tower)) {
            var defenseToReinforce = null;
            _.each(
                defenses, (defense) => {
                    if (!defenseToReinforce || defense.hits < defenseToReinforce.hits) {
                        defenseToReinforce = defense;
                    }
                });

            if (defenseToReinforce) {
                tower.repair(defenseToReinforce);
                this.trackReinforcementOccurred(tower.room);
                result = true;
            }
        }

        return result;
    },

    shouldReinforceDefenses: function(tower) {
        return tower.energy == tower.energyCapacity &&
            this.getTicksSinceLastReinforcement(tower.room) > REINFORCEMENT_INTERVAL &&
            enemyDirectory.getTicksSinceLastContact(tower.room) > REINFORCEMENT_MIN_PEACE_TICKS;
    },

    getTicksSinceLastReinforcement: function(room) {
        var result = Number.MAX_VALUE;

        var tickLastReinforcement = Objects.loadPath(
            Memory, ["TowerManager", "rooms", room.name], "tickLastReinforcement");
        if (tickLastReinforcement) {
            result = Game.time - tickLastReinforcement;
        }

        return result;
    },

    trackReinforcementOccurred: function(room) {
        Objects.savePath(Memory, ["TowerManager", "rooms", room.name], "tickLastReinforcement", Game.time);
    },

    isDefense: function(structure) {
        return structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART;
    }
};
require('util_profiler').registerModule(module);
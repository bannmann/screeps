const MINIMUM_STRENGTH = 1000;
const REINFORCEMENT_MIN_PEACE_TICKS = 100;
const REINFORCEMENT_INTERVAL = 20;
var flagDirectory = require("flagDirectory");
var enemyDirectory = require("enemyDirectory");
var Objects = require("util_objects");

module.exports = {
    manage: function() {
        _.each(
            Game.rooms, (room) => {
                var enemy = enemyDirectory.getTarget(room);

                var towers = room.find(
                    FIND_STRUCTURES, {
                        filter: {structureType: STRUCTURE_TOWER}
                    });

                _.each(
                    towers, (tower) => {
                        var done = false;
                        if (enemy) {
                            tower.attack(enemy);
                            done = true;
                        }

                        var defenses = this.getDefenses(tower);
                        if (!done) {
                            done = this.repairDefenses(tower, defenses);
                        }
                        if (!done) {
                            done = this.healCreeps(tower);
                        }
                        if (!done) {
                            done = this.repairBuildings(tower);
                        }
                        if (!done) {
                            done = this.reinforceDefenses(tower, defenses);
                        }
                    });
            });
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

    getDefenses: function(tower) {
        var result = tower.room.find(
            FIND_STRUCTURES, {
                filter: (structure) => this.isDefense(structure)
            });
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

        var defenseToRepair = null;

        var highestDamageTaken = 0;
        _.each(
            defenses, (defense) => {
                var damageTaken = this.getDamageTaken(defense);
                var repairAmount = this.calculateRepairAmount(tower, defense);
                // We cannot choose how much to repair a structure, so we wait until damage equals the repair amount.
                if (damageTaken >= repairAmount && damageTaken > highestDamageTaken) {
                    defenseToRepair = defense;
                    highestDamageTaken = damageTaken;
                }
            });

        if (defenseToRepair) {
            tower.repair(defenseToRepair);
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

    getDamageTaken: function(wall) {
        if (!wall.memory.strength) {
            wall.memory.strength = Math.max(wall.hits, MINIMUM_STRENGTH);
        } else if (wall.memory.strength < wall.hits) {
            wall.memory.strength = wall.hits;
        }
        return wall.memory.strength - wall.hits;
    },

    repairBuildings: function(tower) {
        var result = false;

        var damagedBuilding = tower.pos.findClosestByRange(
            FIND_STRUCTURES, {
                filter: (structure) => !this.isDefense(structure) &&
                structure.structureType != STRUCTURE_ROAD && structure.hits < structure.hitsMax
            });
        if (damagedBuilding) {
            tower.repair(damagedBuilding);
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
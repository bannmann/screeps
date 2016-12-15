const DEFAULT_STRENGTH = 10000;
var flagDirectory = require("flagDirectory");

module.exports = {
    manage: function() {
        _.each(
            Game.rooms, (room) => {
                var enemy = this.pickEnemy(room);

                var towers = room.find(
                    FIND_STRUCTURES, {
                        filter: {structureType: STRUCTURE_TOWER}
                    });

                towers.forEach(
                    (tower) => {
                        var done = false;
                        if (enemy) {
                            tower.attack(enemy);
                            done = true;
                        }

                        if (!done) {
                            done = this.reinforceDefensiveStructures(tower);
                        }
                        if (!done) {
                            done = this.healCreeps(tower);
                        }
                        if (!done) {
                            done = this.repairNonDefensiveStructures(tower);
                        }
                    });
            });
    },

    pickEnemy: function(room) {
        var enemies = room.find(FIND_HOSTILE_CREEPS);
        var result = null;
        enemies.forEach(
            (enemy) => {
                if (!result || enemy.canHeal && !result.canHeal || enemy.hits < result.hits) {
                    result = enemy;
                }
            });
        return result;
    },

    healCreeps: function(tower) {
        var result = false;

        var creepToHeal = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if (creepToHeal) {
            tower.heal(creepToHeal);
            result = true;
        }

        return result;
    },

    reinforceDefensiveStructures: function(tower) {
        var result = false;

        var walls = tower.room.find(
            FIND_STRUCTURES, {
                filter: (structure) => this.isDefensiveStructure(structure)
            });
        var wallToRepair = null;

        walls.forEach(
            (wall) => {
                if (!wallToRepair || wall.hits < wallToRepair.hits) {
                    wallToRepair = wall;
                }
            });
        if (wallToRepair && wallToRepair.hits < this.getDesiredStrength()) {
            tower.repair(wallToRepair);
            result = true;
        }

        return result;
    },

    getDesiredStrength: function() {
        var result = DEFAULT_STRENGTH;
        var flagInfo = flagDirectory.getFlagInfo("defensiveStrength");
        if (flagInfo) {
            result = parseInt(flagInfo.value);
        }
        return result;
    },

    repairNonDefensiveStructures: function(tower) {
        var result = false;

        var damagedStructure = tower.pos.findClosestByRange(
            FIND_STRUCTURES, {
                filter: (structure) => !this.isDefensiveStructure(structure) && structure.hits < structure.hitsMax
            });
        if (damagedStructure) {
            tower.repair(damagedStructure);
            result = true;
        }

        return result;
    },

    // "Defensive" structure means "has up to 3M hit points, only repair up to certain strength."
    isDefensiveStructure: function(structure) {
        return structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART;
    }
};
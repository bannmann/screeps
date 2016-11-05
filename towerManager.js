const DESIRED_STRENGTH = 10000;

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
                        // Although we always reinforce our defensive, the order of calls matters if energy is low.
                        if (enemy) {
                            tower.attack(enemy);
                            this.reinforceDefensiveStructures(tower);
                        }
                        else {
                            this.reinforceDefensiveStructures(tower);
                            this.healCreeps(tower);
                            this.repairNonDefensiveStructures(tower);
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
        var creepToHeal = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if (creepToHeal) {
            tower.heal(creepToHeal);
        }
    },

    reinforceDefensiveStructures: function(tower) {
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
        if (wallToRepair && wallToRepair.hits < DESIRED_STRENGTH) {
            tower.repair(wallToRepair);
        }
    },

    repairNonDefensiveStructures: function(tower) {
        var damagedStructure = tower.pos.findClosestByRange(
            FIND_STRUCTURES, {
                filter: (structure) => !this.isDefensiveStructure(structure) && structure.hits < structure.hitsMax
            });
        if (damagedStructure) {
            tower.repair(damagedStructure);
        }
    },

    // "Defensive" structure means "has up to 3M hit points, only repair up to DESIRED_STRENGTH."
    isDefensiveStructure: function(structure) {
        return structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART;
    }
};
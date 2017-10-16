const CHECK_INTERVAL = 500;
const SITE_SEARCH_LIMIT = 200;

var logger = require("logger");
var Objects = require("util_objects");

module.exports = {
    manage: function() {
        _.each(Game.flags,
            (flag) => {
                var room = flag.room;
                if (flag.name.startsWith("spawnLocation") && room && room.controller && room.controller.my) {
                    var hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);
                    _.each(hostileStructures, (structure) => {
                        if (structure.structureType != STRUCTURE_STORAGE) {
                            var destroyResult = structure.destroy();
                            if (destroyResult != OK) {
                                Game.notify(
                                    "ConstructionManager could not destroy enemy structure " + structure.id +
                                    " in room " + room.name + ", error " + destroyResult);
                            }
                        }
                    });

                    var siteResult = room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
                    if (siteResult == OK) {
                        flag.remove();
                    } else {
                        Game.notify(
                            "ConstructionManager could not place spawn in room " + room.name + ", error " + siteResult);
                    }
                }
            });

        _.each(Game.rooms,
            (room) => {
                if (this.isCheckScheduled(room) || this.isRoomLevelDifferent(room)) {
                    this.checkRoom(room);
                }
            });
    },

    isCheckScheduled: function(room) {
        return Game.time % CHECK_INTERVAL == room.name.hashCode() % CHECK_INTERVAL;
    },

    isRoomLevelDifferent: function(room) {
        var knownLevel = this.getKnownRoomLevel(room);
        var currentLevel = this.getCurrentRoomLevel(room);

        return currentLevel && currentLevel != knownLevel;
    },

    getKnownRoomLevel: function(room) {
        return Objects.loadPath(Memory, ["ConstructionManager", "rooms", room.name], "level");
    },

    getCurrentRoomLevel: function(room) {
        // Why 0? Not all rooms have a controller.
        return Objects.loadPath(room, ["controller"], "level") || 0;
    },

    checkRoom: function(room) {
        var level = this.getCurrentRoomLevel(room);
        this.ensureEnoughExtensionsExist(room, level);
        this.scanWalls(room);
        this.updateKnownRoomLevel(room);
    },

    ensureEnoughExtensionsExist: function(room, level) {
        if (level > 0) {
            var extensions = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            }).length;
            var extensionsBeingBuilt = room.find(FIND_CONSTRUCTION_SITES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            }).length;
            var maxExtensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];

            var extensionsToBuild = maxExtensionCount - extensions - extensionsBeingBuilt;
            if (extensionsToBuild > 0) {
                var spawns = room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_SPAWN }
                });

                if (spawns.length > 0) {
                    var spawn = spawns[0];

                    logger.log(room.name + " gets " + extensionsToBuild + " extensions");
                    this.createExtensions(room, extensionsToBuild, spawn);
                }
            }
        }
    },

    createExtensions: function(room, extensionsToBuild, spawn) {
        var constructionSites = this.getConstructionSites(room);

        var sitesFound = 0;
        var diameter = 1;
        var siteIndexGlobal = 0;
        var siteIndexInDiameter = 0;
        while (sitesFound < extensionsToBuild) {
            var x;
            var y;
            var sitesPerSide = diameter;
            var side = Math.floor(siteIndexInDiameter / sitesPerSide);
            var siteIndexInSide = siteIndexInDiameter % sitesPerSide;

            switch (side) {
                case 0:
                    x = spawn.pos.x - diameter + siteIndexInSide * 2;
                    y = spawn.pos.y - diameter;
                    break;
                case 1:
                    x = spawn.pos.x + diameter;
                    y = spawn.pos.y - diameter + siteIndexInSide * 2;
                    break;
                case 2:
                    x = spawn.pos.x + diameter - siteIndexInSide * 2;
                    y = spawn.pos.y + diameter;
                    break;
                case 3:
                    x = spawn.pos.x - diameter;
                    y = spawn.pos.y + diameter - siteIndexInSide * 2;
                    break;
            }

            var isFree = this.isFree(room, x, y);

            var hasNoConstructionSite = !(constructionSites[x][y]);
            if (isFree && hasNoConstructionSite) {
                var created = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
                if (created != OK) {
                    Game.notify(
                        "ConstructionManager encountered createConstructionSite result of " + created + " in room " +
                        room.name);
                }
                sitesFound++;
            }

            if (side == 3 && siteIndexInSide == sitesPerSide - 1) {
                diameter++;
                siteIndexInDiameter = 0;
            }
            else {
                siteIndexInDiameter++;
            }

            siteIndexGlobal++;
            if (siteIndexGlobal > SITE_SEARCH_LIMIT) {
                Game.notify("ConstructionManager could not find enough sites in room " + room.name);
                break;
            }
        }
    },

    getConstructionSites: function(room) {
        var result = this.createPositionArrays();
        _.each(
            room.find(FIND_CONSTRUCTION_SITES), (site) => {
                result[site.pos.x][site.pos.y] = site;
            });
        return result;
    },

    createPositionArrays: function() {
        var result = [];
        for (var i = 0; i < 50; i++) {
            result.push([]);
        }
        return result;
    },

    isFree: function(room, x, y) {
        return this.hasNoStructure(room, x, y) && !this.isBlockingSource(room, x, y);
    },

    hasNoStructure: function(room, x, y) {
        var result = _.filter(
                room.lookAt(x, y), (entry) => {
                    return entry.type == LOOK_TERRAIN && entry.terrain == "wall" || entry.type == LOOK_STRUCTURES;
                }).length == 0;
        return result;
    },

    isBlockingSource: function(room, x, y) {
        var result = false;
        var sourceObjects = room.find(FIND_SOURCES);
        _.each(
            sourceObjects, (sourceObject) => {
                if (sourceObject.pos.isNearTo(x, y)) {
                    result = true;
                }
            });
        return result;
    },

    scanWalls: function(room) {
        var wallIds = [];
        const wallObjects = room.find(
            FIND_STRUCTURES, {
                filter: {structureType: STRUCTURE_WALL}
            });
        _.each(wallObjects, (wall) => wallIds.push(wall.id));
        Objects.savePath(Memory, ["ConstructionManager", "rooms", room.name], "wallIds", wallIds);
    },

    updateKnownRoomLevel: function(room) {
        Objects.savePath(Memory, ["ConstructionManager", "rooms", room.name], "level", this.getCurrentRoomLevel(room));
    },

    getWalls: function(room) {
        var result = [];
        var ids = Objects.loadPath(Memory, ["ConstructionManager", "rooms", room.name], "wallIds");
        _.each(ids, (id) => {
            var wall = Game.getObjectById(id);
            if (wall) {
                result.push(wall);
            }
        });
        return result;
    }
};
require('util_profiler').registerModule(module);
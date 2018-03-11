const CHECK_INTERVAL = 500;

var logger = require("logger");
var Objects = require("util_objects");

module.exports = {
    manage: function() {
        var claimedRooms = {};

        _.each(Game.rooms,
            (room) => {
                if (room.claimed) {
                    if (this.isCheckScheduled(room) || this.isRoomLevelDifferent(room)) {
                        this.checkRoom(room);
                    }
                    if (this.needsSpawn(room)) {
                        this.createSpawn(room);
                    }
                    claimedRooms[room.name] = true;
                }
            });

        var roomMemory = Memory.ConstructionManager.rooms;
        _.forOwnRight(
            roomMemory, (value, key) => {
                if (!(key in claimedRooms)) {
                    delete roomMemory[key];
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
        var structures = this.getStructures(room);
        var constructionSites = this.getConstructionSites(room);
        var walls = _.filter(structures, { structureType: STRUCTURE_WALL });
        var level = this.getCurrentRoomLevel(room);
        this.ensureEnoughExtensionsExist(room, structures, constructionSites, walls, level);
        this.storeWalls(room, walls);
        this.verifyTowerCount(room, structures, constructionSites, level);
        this.updateKnownRoomLevel(room);
    },

    getStructures: function(room) {
        return room.find(FIND_STRUCTURES);
    },

    getConstructionSites: function(room) {
        return room.find(FIND_CONSTRUCTION_SITES);
    },

    ensureEnoughExtensionsExist: function(room, structures, constructionSites, walls, level) {
        var extensions = _.filter(structures, { structureType: STRUCTURE_EXTENSION });
        var extensionsBeingBuilt = _.filter(constructionSites, { structureType: STRUCTURE_EXTENSION });
        var maxExtensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];

        var newExtensionCount = maxExtensionCount - extensions.length - extensionsBeingBuilt.length;
        if (newExtensionCount > 0) {
            var spawns = _.filter(structures, { structureType: STRUCTURE_SPAWN });
            if (spawns.length > 0) {
                logger.log(room.name + " gets " + newExtensionCount + " extensions");
                this.createExtensions(
                    room,
                    newExtensionCount,
                    extensions,
                    extensionsBeingBuilt,
                    constructionSites,
                    walls,
                    spawns[0]);
            }
        }
    },

    createExtensions: function(room, newExtensionCount, extensions, extensionsBeingBuilt, constructionSites, walls, spawn) {
        var constructionSitePositions = this.convertToPositionArray(constructionSites);

        var sitesFound = 0;
        var diameter = 1;
        var siteIndexGlobal = 0;
        var siteIndexInDiameter = 0;
        while (sitesFound < newExtensionCount) {
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

            var isFree = this.isFree(room, walls, x, y);

            var hasNoConstructionSite = !(constructionSitePositions[x][y]);
            if (isFree && hasNoConstructionSite && this.isValidExtensionPos(x, y, constructionSitePositions, spawn) &&
                this.wouldNotBlock(x, y, room)) {
                var createResult = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
                if (createResult != OK) {
                    logger.notifyError(
                        "Failed to create construction site at " + x + "," + y + " in room " + room.name,
                        createResult);
                }

                // Allow subsequent iterations in this tick to place a neighboring extension
                constructionSitePositions[x][y] = { structureType: STRUCTURE_EXTENSION, dummy: true };

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
        }
    },

    convertToPositionArray: function(sites) {
        var result = this.createPositionArrays();
        _.each(
            sites, (site) => {
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

    isFree: function(room, walls, x, y) {
        return !this.isBlocked(room, x, y) && !this.wouldBlockSource(room, x, y) &&
            !this.wouldBeCloseToWall(walls, x, y);
    },

    isBlocked: function(room, x, y) {
        var result = _.filter(
                room.lookAt(x, y), (entry) => {
                    return entry.type == LOOK_TERRAIN && entry.terrain == "wall" || entry.type == LOOK_STRUCTURES;
                }).length > 0;
        return result;
    },

    wouldBlockSource: function(room, x, y) {
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

    wouldBeCloseToWall: function(walls, x, y) {
        return _.some(walls, (wall) => wall.pos.inRangeTo(x, y, 2));
    },

    isValidExtensionPos: function(x, y, constructionSitePositions, spawn) {
        return spawn.pos.isNearTo(x, y) || this.isNeighborOfExtensionSite(x, y, constructionSitePositions, spawn.room) ||
            this.isNeighborOfExtension(x, y, spawn.room);
    },

    isNeighborOfExtensionSite: function(x, y, constructionSitePositions) {
        function check(x, y) {
            var site = constructionSitePositions[x][y];
            return site && site.structureType == STRUCTURE_EXTENSION;
        }
        return check(x + 1, y + 1) || check(x + 1, y - 1) || check(x - 1, y + 1) || check(x - 1, y - 1);
    },

    isNeighborOfExtension: function(x, y, room) {
        function check(x, y) {
            return _.filter(room.lookForAt(LOOK_STRUCTURES, x, y), { structureType: STRUCTURE_EXTENSION }).length == 1;
        }
        return check(x + 1, y + 1) || check(x + 1, y - 1) || check(x - 1, y + 1) || check(x - 1, y - 1);
    },

    wouldNotBlock: function(x, y, room) {
        var blockedCount = 0 + this.isBlocked(room, x + 1, y) + this.isBlocked(room, x, y + 1) +
            this.isBlocked(room, x - 1, y) + this.isBlocked(room, x, y - 1);
        return blockedCount < 2;
    },

    storeWalls: function(room, walls) {
        var wallIds = [];
        _.each(walls, (wall) => wallIds.push(wall.id));
        Objects.savePath(Memory, ["ConstructionManager", "rooms", room.name], "wallIds", wallIds);
    },

    verifyTowerCount: function(room, structures, constructionSites, level) {
        var towers = _.filter(structures, { structureType: STRUCTURE_TOWER });
        var towersBeingBuilt = _.filter(constructionSites, { structureType: STRUCTURE_TOWER });
        var maxTowerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][level];
        var towerCount = towers.length + towersBeingBuilt.length;
        if (towerCount < maxTowerCount) {
            logger.notify(room.name + " has " + towerCount + " towers, " + maxTowerCount + " allowed");
        }
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
    },

    needsSpawn: function(room) {
        return room.claimed && this.hasNoSpawns(room) && this.hasNoSpawnConstructionSite(room);
    },

    hasNoSpawns: function(room) {
        return room.find(FIND_MY_SPAWNS).length == 0;
    },

    hasNoSpawnConstructionSite: function(room) {
        return room.find(
                FIND_MY_CONSTRUCTION_SITES, {
                    filter: {structureType: STRUCTURE_SPAWN}
                }).length == 0;
    },

    createSpawn: function(room) {
        var hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);
        _.each(hostileStructures, (structure) => {
            if (structure.structureType != STRUCTURE_STORAGE) {
                var destroyResult = structure.destroy();
                if (destroyResult != OK) {
                    logger.notifyError(
                        "ConstructionManager could not destroy enemy structure " + structure.id +
                        " in room " + room.name, destroyResult);
                }
            }
        });

        var spawnPosition = null;
        var sources = room.find(FIND_SOURCES);
        switch(sources.length) {
            case 0:
                logger.notify("ConstructionManager could not place spawn, no sources found");
                break;
            case 1:
                var pathFinderResult = PathFinder.search(sources[0].pos, {pos: room.controller.pos, range: 1});
                var index = Math.min(5, parseInt(pathFinderResult.path.length / 2));
                spawnPosition = pathFinderResult.path[index];
                break;
            case 2:
                var pathFinderResult = PathFinder.search(sources[0].pos, {pos: sources[1].pos, range: 1});
                spawnPosition = pathFinderResult.path[parseInt(pathFinderResult.path.length / 2)];
                break;
            default:
                var sortedSources = _.sortBy(sources, "id");
                var waypointTopLeft = {x: 50, y: 50};
                var waypointBottomRight = {x: 0, y: 0};
                var waypointSum = {x: 0, y: 0};
                var waypointCount = 0;
                for (var origin = 0; origin < sortedSources.length - 1; origin++) {
                    for (var destination = origin + 1; destination < sortedSources.length; destination++) {
                        var pathFinderResult = PathFinder.search(
                            sortedSources[origin].pos, {
                                pos: sortedSources[destination].pos, range: 1
                            });

                        var waypoint = pathFinderResult.path[parseInt(pathFinderResult.path.length / 2)];

                        waypointTopLeft.x = Math.min(waypointTopLeft.x, waypoint.x);
                        waypointTopLeft.y = Math.min(waypointTopLeft.y, waypoint.y);
                        waypointBottomRight.x = Math.max(waypointTopLeft.x, waypoint.x);
                        waypointBottomRight.y = Math.max(waypointTopLeft.y, waypoint.y);

                        waypointSum.x += waypoint.x;
                        waypointSum.y += waypoint.y;

                        waypointCount++;
                    }
                }

                var average = new RoomPosition(
                    parseInt(waypointSum.x / waypointCount),
                    parseInt(waypointSum.y / waypointCount),
                    room.name);

                var diameter = 1;
                var siteIndexInDiameter = 0;
                while (true) {
                    var x;
                    var y;
                    var sitesPerSide = diameter * 2;
                    var side = Math.floor(siteIndexInDiameter / sitesPerSide);
                    var siteIndexInSide = siteIndexInDiameter % sitesPerSide;

                    switch (side) {
                        case 0:
                            x = average.x - diameter + siteIndexInSide;
                            y = average.y - diameter;
                            break;
                        case 1:
                            x = average.x + diameter;
                            y = average.y - diameter + siteIndexInSide;
                            break;
                        case 2:
                            x = average.x + diameter - siteIndexInSide;
                            y = average.y + diameter;
                            break;
                        case 3:
                            x = average.x - diameter;
                            y = average.y + diameter - siteIndexInSide;
                            break;
                    }
                    if (this.isFree(room, x, y)) {
                        spawnPosition = new RoomPosition(x, y, room.name);
                        break;
                    }

                    if (side == 3 && siteIndexInSide == sitesPerSide - 1) {
                        diameter++;
                        siteIndexInDiameter = 0;
                    }
                    else {
                        siteIndexInDiameter++;
                    }
                }
                break;
        }

        if (spawnPosition) {
            var siteResult = room.createConstructionSite(spawnPosition, STRUCTURE_SPAWN);
            if (siteResult == OK) {
                logger.log("Created spawn at " + spawnPosition);
            }
            else {
                logger.notifyError(
                    "ConstructionManager could not place spawn at " + spawnPosition, siteResult);
            }
        }
    }
};
require('util_profiler').registerModule(module);
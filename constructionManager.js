const CHECK_INTERVAL = 500;

var logger = require("logger");
var Objects = require("util_objects");

module.exports = {
    manage: function() {
        _.each(Game.flags,
            (flag) => {
                if (flag.name.startsWith("spawnLocation") && flag.room && flag.room.controller && flag.room.controller.my) {
                    flag.room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
                    flag.remove();
                }
            });

        _.each(Game.rooms,
            (room) => {
                if (this.isCheckScheduled() || this.isRoomLevelDifferent(room)) {
                    var level = this.getCurrentRoomLevel(room);
                    this.ensureEnoughExtensionsExist(room, level);
                    this.updateKnownRoomLevel(room);
                }
            });
    },

    isCheckScheduled: function() {
        return Game.time % CHECK_INTERVAL == 0;
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
                logger.log(room.name + " gets " + extensionsToBuild + " extensions");
            }

            var spawns = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_SPAWN }
            });

            if (spawns.length > 0) {
                var spawn = spawns[0];

                this.createExtensions(room, extensionsToBuild, spawn);
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
            if (siteIndexGlobal > 100) {
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

    updateKnownRoomLevel: function(room) {
        Objects.savePath(Memory, ["ConstructionManager", "rooms", room.name], "level", this.getCurrentRoomLevel(room));
    }
};
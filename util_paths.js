const OBSTACLE_COST = 255;
const EXIT_COST = 6;

var roomsUtil = require("util_rooms");
var roomDirectory = require("roomDirectory");

var data = {};

module.exports = {
    /**
     * @return an object containing serialized paths, key is the room name
     */
    findPath: function(from, to, intentRange) {
        var pathFinderResult = this.invokePathFinder(from, to, intentRange);
        var result;
        if (pathFinderResult.incomplete) {
            console.log("PathFinder failed: from = " + JSON.stringify(from) + ", to = " + JSON.stringify(to) + ", ops = " + pathFinderResult.ops + ", cost = " + pathFinderResult.cost);
            result = null;
        } else {
            var input = pathFinderResult.path;
            result = this.splitAndConvertPath(from, input);
        }
        return result;
    },

    invokePathFinder: function(from, to, intentRange) {
        var allowedRooms;
        if (this.needsRoomRouting(from, to)) {
            var route = Game.map.findRoute(from.roomName, to.roomName, {routeCallback: this.getRoomCost});

            allowedRooms = {[ from.roomName ]: true};
            _.each(
                route, (info) => {
                    allowedRooms[info.room] = true;
                });
        }

        return PathFinder.search(
            from, {pos: to, range: intentRange}, {
                roomCallback: (roomName) => {
                    var result;
                    if (allowedRooms && allowedRooms[roomName] === undefined) {
                        result = false;
                    } else {
                        result = this.getCostMatrix(roomName);
                    }
                    return result;
                },
                maxOps: 6000
            });
    },

    needsRoomRouting: function(from, to) {
        return !this.areRoomsConnected(from.roomName, to.roomName);
    },

    areRoomsConnected: function(roomName1, roomName2) {
        return _.some(Game.map.describeExits(roomName1), (room) => room == roomName2);
    },

    getRoomCost: function(roomName) {
        if (roomsUtil.isHighway(roomName)) {
            return 0.75;
        }
        else if (roomsUtil.hasSourceKeepers(roomName) || roomDirectory.isEnemyTerritory(roomName)) {
            return 7;
        }
        else {
            return 1;
        }
    },

    splitAndConvertPath: function(from, input) {
        var result = {};
        var pathInRoom = [];
        result[from.roomName] = pathInRoom;
        var lastPosition = from;
        _.each(
            input, (position) => {
                if (position.roomName != lastPosition.roomName) {
                    result[lastPosition.roomName] = Room.serializePath(result[lastPosition.roomName]);
                    pathInRoom = [];
                    result[position.roomName] = pathInRoom;
                } else {
                    pathInRoom.push(
                        {
                            x: position.x,
                            y: position.y,
                            dx: position.x - lastPosition.x,
                            dy: position.y - lastPosition.y,
                            direction: lastPosition.getDirectionTo(position)
                        });
                }
                lastPosition = position;
            });
        result[lastPosition.roomName] = Room.serializePath(result[lastPosition.roomName]);
        return result;
    },

    getCostMatrix: function(roomName) {
        var result = data.rooms[roomName];
        if (!result) {
            result = new PathFinder.CostMatrix();
            data.rooms[roomName] = result;

            this.putStructureCosts(result, roomName);
            this.putExitCosts(result, roomName);
        }
        return result;
    },

    /**
     * Avoid running into non-walkable structures.
     */
    putStructureCosts: function(costMatrix, roomName) {
        // Structures can only be enumerated if the room is visible, i.e. the player has creeps/structures there.
        if (roomName in Game.rooms) {
            var structures = Game.rooms[roomName].find(FIND_STRUCTURES);
            _.each(
                structures, (structure) => {
                    if (structure.structureType != STRUCTURE_ROAD &&
                        (structure.structureType != STRUCTURE_RAMPART || !structure.my)) {
                        costMatrix.set(structure.pos.x, structure.pos.y, OBSTACLE_COST);
                    }
                });
        }
    },

    /**
     * Make it costly to enter exit squares. This way, creeps only do this when they have to, not accidentally.
     */
    putExitCosts: function(costMatrix, roomName) {
        var exits = Game.map.describeExits(roomName);
        if (roomName == "sim") {
            // In simulation mode, describeExits() returns null. Make sure the loop below works despite this.
            exits = {};
            exits[LEFT] = "nowhere";
            exits[RIGHT] = "nowhere";
        }

        for (var i = 1; i < 49; i++) {
            if (LEFT in exits) increaseCostIfExit(0, i);
            if (RIGHT in exits) increaseCostIfExit(49, i);
            if (TOP in exits) increaseCostIfExit(i, 0);
            if (BOTTOM in exits) increaseCostIfExit(i, 49);
        }

        function increaseCostIfExit(x, y) {
            var terrain = Game.map.getTerrainAt(x, y, roomName);

            // Skip setting the cost if there is a wall to avoid creating impossible paths.
            if (terrain != "wall") {
                costMatrix.set(x, y, EXIT_COST);
            }
        }
    },

    onTickStarting: function() {
        data.rooms = {};
    }
};
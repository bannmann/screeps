const ACCEPTABLE_PAUSE = 1;
const ACCEPTABLE_DETOUR_FACTOR = 2;
const ACCEPTABLE_PAUSES_PER_TARGET = 1;
const MAX_PAUSE_LIST_LENGTH = 10;

var pathsUtil = require("util_paths");

module.exports = {
    onTickStarting: function() {
        this.pauseListsByTarget = Memory["CreepMovementPauses"] || {};
        this.currentTickCreepPauses = {};
    },

    isTargetJammed: function(roomObject) {
        var targetPositionString = this.makePositionString(roomObject.pos);
        var pauseList = this.pauseListsByTarget[targetPositionString];
        var result = false;
        if (pauseList) {
            result = !!pauseList.find(
                function(element) {
                    return element > ACCEPTABLE_PAUSES_PER_TARGET
                });
        }
        return result;
    },

    onTickEnding: function() {
        // Add pauses of this tick to existing lists
        _.each(this.pauseListsByTarget, (pauseList, target) => {
            var currentPause = this.currentTickCreepPauses[target] || 0;
            pauseList.push(currentPause);

            while (pauseList.length > MAX_PAUSE_LIST_LENGTH) {
                pauseList.shift();
            }

            // Skip this target in the loop below
            delete this.currentTickCreepPauses[target];
        });

        // Add lists for targets that had no previous pauses
        _.each(this.currentTickCreepPauses, (currentPause, target) => {
            this.pauseListsByTarget[target] = [currentPause];
        });

        Memory["CreepMovementPauses"] = this.pauseListsByTarget;
    },

    start: function(creep, intentRange, targetRoomPosition) {
        var result = false;
        if (this.isMovementNeeded(creep, intentRange, targetRoomPosition)) {
            var roomPaths = pathsUtil.findPath(creep.pos, targetRoomPosition, intentRange);
            if (!roomPaths) {
                creep.logInfo(
                    "path finding from " + JSON.stringify(creep.pos) + " to " + JSON.stringify(targetRoomPosition) +
                    " failed");
            }
            else {
                creep.memory.movementStatus = {
                    pauseDuration: 0,
                    lastPosition: null,
                    lastRoom: creep.pos.roomName,
                    roomPaths: roomPaths,
                    intentRange: intentRange,
                    target: targetRoomPosition
                };
                creep.logDebug(
                    "starting movement to " + JSON.stringify(targetRoomPosition) + " with intentRange " + intentRange);
                result = true;
            }
        } else {
            creep.logDebug("no movement needed to " + JSON.stringify(targetRoomPosition));
            result = true;
        }
        return result;
    },

    isMovementNeeded(creep, intentRange, targetRoomPosition) {
        return targetRoomPosition.roomName != creep.pos.roomName || !creep.pos.inRangeTo(targetRoomPosition, intentRange);
    },

    isActive: function(creep) {
        var result = creep.memory.movementStatus != undefined;
        creep.logDebug("movement active = " + result);
        return result;
    },

    perform: function(creep) {
        var status = this.getStatus(creep);

        if (status.lastRoom != creep.pos.roomName) {
            // The creep just switched rooms and is now located on the new room's exit. Leave it to avoid oscillating.
            creep.logDebug("entering " + creep.pos.roomName + " to " + creep.memory.intent);

            delete status.detourPath;
        }

        if (this.isTargetInRange(creep, status)) {
            creep.logDebug("stopping");
            this.stop(creep);
        }
        else {
            this.checkAndAdaptMovement(creep, status);
            creep.logDebug("moving");

            var roomPath = this.getCurrentRoomPath(creep, status);
            creep.moveByPath(roomPath);
        }
    },

    getStatus: function(creep) {
        return creep.memory.movementStatus;
    },

    isTargetInRange: function(creep, status) {
        var targetPosition = this.getTargetPosition(status);
        var range = creep.pos.getRangeTo(targetPosition);
        return range <= status.intentRange;
    },

    getTargetPosition: function(status) {
        return new RoomPosition(status.target.x, status.target.y, status.target.roomName);
    },

    stop: function(creep) {
        delete creep.memory.movementStatus;
    },

    checkAndAdaptMovement: function(creep, status) {
        var currentPosition = this.makePositionString(creep.pos);
        if (currentPosition == status.lastPosition) {
            this.publishPause(status);

            status.pauseDuration++;
            if (status.pauseDuration > ACCEPTABLE_PAUSE) {
                this.takeDetour(creep, status);
                status.pauseDuration = 0;
            }
        }
        else if (status.pauseDuration > 0) {
            status.pauseDuration = 0;
        }
        status.lastPosition = currentPosition;
        status.lastRoom = creep.pos.roomName;
    },

    getCurrentRoomPath: function(creep, status) {
        var result = status.roomPaths[creep.pos.roomName];
        if (status.detourPath) {
            result = status.detourPath;
        }
        return result;
    },

    makePositionString: function(roomPosition) {
        return roomPosition.roomName + "-" + roomPosition.x + "-" + roomPosition.y;
    },

    publishPause: function(status) {
        var targetPositionString = this.makePositionString(status.target);
        var pauses = this.currentTickCreepPauses[targetPositionString];
        if (pauses) {
            this.currentTickCreepPauses[targetPositionString] = pauses + 1;
        }
        else {
            this.currentTickCreepPauses[targetPositionString] = 1;
        }
    },

    takeDetour: function(creep, status) {
        var roomTarget = this.getCurrentRoomTarget(creep, status);
        var creepCausedDetour = creep.pos.findPathTo(roomTarget, {ignoreCreeps: false});
        if (creepCausedDetour.length == 0) {
            // all paths are blocked by other creeps, this creep has no choice but to wait
            creep.logDebug("all paths blocked by other creeps");
        }
        else {
            var optimalPath = creep.pos.findPathTo(roomTarget, {ignoreCreeps: true});
            if (creepCausedDetour.length <= optimalPath.length * ACCEPTABLE_DETOUR_FACTOR) {
                creep.logDebug("taking detour: " + JSON.stringify(creepCausedDetour));
                status.detourPath = Room.serializePath(creepCausedDetour);
            } else {
                creep.logDebug("detour of " + creepCausedDetour.length + "is too long");
            }
        }
    },

    getCurrentRoomTarget: function(creep, status) {
        var result;

        var finalTarget = this.getTargetPosition(status);
        if (finalTarget.roomName == creep.pos.roomName) {
            result = finalTarget;
        } else {
            // Target is the end position of the path within this room so it aligns with the path in the next room
            var roomPath = Room.deserializePath(this.getCurrentRoomPath(creep, status));
            var lastStep = _.last(roomPath);
            result = new RoomPosition(lastStep.x, lastStep.y, creep.pos.roomName);
        }

        return result;
    }
};
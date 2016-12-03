const ACCEPTABLE_PAUSE = 1;
const ACCEPTABLE_DETOUR_FACTOR = 2;
const ACCEPTABLE_PAUSES_PER_TARGET = 1;
const MAX_PAUSE_LIST_LENGTH = 10;

module.exports = {
    pauseListsByTarget: Memory["CreepMovementPauses"] || {}, currentTickCreepPauses: {},

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

    savePauseStats: function() {
        // Add pauses of this tick to existing lists
        for (var target in this.pauseListsByTarget) {
            var pauseList = this.pauseListsByTarget[target];

            var currentPause = this.currentTickCreepPauses[target] || 0;
            pauseList.push(currentPause);

            while (pauseList.length > MAX_PAUSE_LIST_LENGTH) {
                pauseList.shift();
            }

            // Skip this target in the loop below
            delete this.currentTickCreepPauses[target];
        }

        // Add lists for targets that had no previous pauses
        for (var target in this.currentTickCreepPauses) {
            var currentPause = this.currentTickCreepPauses[target];
            this.pauseListsByTarget[target] = [currentPause];
        }

        Memory["CreepMovementPauses"] = this.pauseListsByTarget;
        this.currentTickCreepPauses = {};
    },

    start: function(creep, path, intentRange, targetRoomPosition) {
        if (this.isMovementNeeded(creep, path, intentRange, targetRoomPosition)) {
            creep.memory.movementStatus = {
                pauseDuration: 0,
                lastPosition: null,
                lastRoom: creep.pos.roomName,
                path: Room.serializePath(path),
                intentRange: intentRange,
                target: targetRoomPosition
            };
            creep.logDebug("starting movement to " + JSON.stringify(targetRoomPosition) + " with intentRange " + intentRange);
        } else {
            creep.logDebug("no movement needed to " + JSON.stringify(targetRoomPosition));
        }
    },

    isMovementNeeded(creep, path, intentRange, targetRoomPosition) {
        return targetRoomPosition.roomName != creep.pos.roomName || path.length > 1 || path.length == 1 && !creep.pos.inRangeTo(path[0].x, path[0].y, intentRange);
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

            var targetPosition = this.getTargetPosition(status);
            status.path = Room.serializePath(creep.pos.findPathTo(targetPosition, {ignoreCreeps: true}));
        }

        if (this.isLegacyStatus(status) || this.isTargetInRange(creep, status)) {
            creep.logDebug("stopping");
            this.stop(creep);
        }
        else {
            this.checkAndAdaptMovement(creep, status);
            creep.moveByPath(status.path);
            creep.logDebug("moving");
        }
    },

    getStatus: function(creep) {
        return creep.memory.movementStatus;
    },

    isLegacyStatus: function(status) {
        return !status.target || status.target.roomName === undefined;
    },

    isTargetInRange: function(creep, status) {
        var targetPosition = this.getTargetPosition(status);
        return creep.pos.getRangeTo(targetPosition) <= status.intentRange;
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
            }
        }
        else if (status.pauseDuration > 0) {
            status.pauseDuration = 0;
        }
        status.lastPosition = currentPosition;
        status.lastRoom = creep.pos.roomName;
    },

    makePositionString: function(positionObject) {
        return positionObject.x + "-" + positionObject.y;
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
        var targetPosition = this.getTargetPosition(status);

        var creepCausedDetour = creep.pos.findPathTo(targetPosition, {ignoreCreeps: false});
        if (creepCausedDetour.length == 0) {
            // blocked by other creep
        }
        else {
            var optimalPath = creep.pos.findPathTo(targetPosition, {ignoreCreeps: true});
            if (creepCausedDetour.length <= optimalPath.length * ACCEPTABLE_DETOUR_FACTOR) {
                status.path = Room.serializePath(creepCausedDetour);
            }
        }
    }
};
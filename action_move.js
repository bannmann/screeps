const ACCEPTABLE_PAUSE = 1;
const ACCEPTABLE_DETOUR_FACTOR = 2;
const ACCEPTABLE_PAUSES_PER_TARGET = 1;
const MAX_PAUSE_LIST_LENGTH = 10;

module.exports = {
    pauseListsByTarget: Memory["CreepMovementPauses"] || {}, currentTickCreepPauses: {},

    isTargetJammed: function(id) {
        var pauseList = this.pauseListsByTarget[id];
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

    start: function(creep, path, intentRange) {
        if (this.isMovementNeeded(creep, path, intentRange)) {
            var target = path[path.length - 1];
            creep.memory.movementStatus = {
                pauseDuration: 0,
                lastPosition: null,
                path: Room.serializePath(path),
                intentRange: intentRange,
                target: {x: target.x, y: target.y}
            };
        }
    },

    isMovementNeeded(creep, path, intentRange) {
        return path.length > 1 || path.length == 1 && !creep.pos.inRangeTo(path[0].x, path[0].y, intentRange);
    },

    isActive: function(creep) {
        return creep.memory.movementStatus != undefined;
    },

    perform: function(creep) {
        var status = this.getStatus(creep);

        if (this.isTargetInRange(creep, status)) {
            this.stop(creep);
        }
        else {
            this.checkAndAdaptMovement(creep, status);
            creep.moveByPath(status.path);
        }
    },

    getStatus: function(creep) {
        return creep.memory.movementStatus;
    },

    isTargetInRange: function(creep, status) {
        var targetPosition = this.getTargetPosition(creep, status);
        return creep.pos.getRangeTo(targetPosition) <= status.intentRange;
    },

    getTargetPosition: function(creep, status) {
        return creep.room.getPositionAt(status.target.x, status.target.y);
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
        var targetPosition = this.getTargetPosition(creep, status);

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
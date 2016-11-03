const ACCEPTABLE_PAUSE = 1;
const ACCEPTABLE_DETOUR_FACTOR = 2;
const ACCEPTABLE_PAUSES_PER_TARGET = 1;
const MAX_PAUSE_LIST_LENGTH = 10;

module.exports = {
    pauseListsByTarget: Memory["CreepMovementPauses"] || {},
    currentTickCreepPauses: {},

    isTargetJammed: function(id) {
        var pauseList = this.pauseListsByTarget[id];
        var result = false;
        if (pauseList) {
            result = !!pauseList.find(function(element) {return element > ACCEPTABLE_PAUSES_PER_TARGET});
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

    start: function(creep, path, intent) {
        if (this.isMovementNeeded(creep, path, intent)) {
            creep.memory.movementStatus = {
                pauseDuration: 0,
                lastPosition: null,
                path: Room.serializePath(path)
            };
        }
    },

    isMovementNeeded(creep, path, intent) {
        if (path.length > 1 && !path[0]) {
            Game.notify("isMovementNeeded: path is ***" + JSON.stringify(path) + "***, intent=" + intent + ", movementStatus ***" + JSON.stringify(creep.memory.movementStatus) + "***");
        }
        return path.length > 1 || !creep.pos.inRangeTo(path[0].x, path[0].y, intent.range);
    },

    isActive: function(creep) {
        return creep.memory.movementStatus != undefined;
    },

    perform: function(creep, intent) {
        var target = Game.getObjectById(creep.memory.target);
        var status = creep.memory.movementStatus;

        var currentPosition = creep.pos.x + "-" + creep.pos.y;
        if (currentPosition == status.lastPosition) {
            status.pauseDuration++;
            var pauses = this.currentTickCreepPauses[creep.memory.target];
            if (pauses) {
                this.currentTickCreepPauses[creep.memory.target] = pauses + 1;
            }
            else {
                this.currentTickCreepPauses[creep.memory.target] = 1;
            }
        }
        else {
            status.pauseDuration = 0;
        }

        if (status.pauseDuration > ACCEPTABLE_PAUSE) {
            var creepCausedDetour = creep.pos.findPathTo(target, {ignoreCreeps: false});
            if (creepCausedDetour.length == 0) {
                // blocked by other creep
            }
            else {
                var optimalPath = creep.pos.findPathTo(target, {ignoreCreeps: true});
                if (creepCausedDetour.length <= optimalPath.length * ACCEPTABLE_DETOUR_FACTOR) {
                    status.path = Room.serializePath(creepCausedDetour);
                }
            }
        }

        creep.moveByPath(status.path);
        if (creep.pos.getRangeTo(target) <= intent.range) {
            this.stop(creep);
        }

        status.lastPosition = currentPosition;
    },

    stop: function(creep) {
        delete creep.memory.movementStatus;
    }
};
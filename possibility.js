var moveAction = require("action_move");

module.exports = function(parameters) {
    var creep = parameters.creep;
    var intent = parameters.intent;
    var roomObject = parameters.roomObject;
    var roomName = parameters.roomName;
    var shortDistanceFactor = parameters.shortDistanceFactor || 0;
    var baseImportance = parameters.baseImportance;
    var preparationFunction = parameters.preparationFunction;
    var intentStatus = parameters.intentStatus || {};

    this.debug = { intentName: intent.name, intentStatus: intentStatus };

    this.importance = baseImportance;

    var position;
    if (roomObject) {
        position = roomObject.pos;
    } else if (roomName) {
        position = new RoomPosition(25, 25, roomName);
    }

    if (position) {
        this.debug.targetPos = position;

        if (shortDistanceFactor) {
            var distance = creep.pos.getApproximateRangeTo(roomObject);
            var shortDistance = 1 / Math.max(1, distance - intent.range);
            this.importance += shortDistance * shortDistanceFactor;
        }
    }

    this.choose = function() {
        creep.memory.intentStatus = intentStatus;
        if (preparationFunction) preparationFunction.call(parameters);
        activateIntent(intent);
    };

    function activateIntent(intent) {
        var canActivate = true;
        if (position) {
            canActivate = moveAction.start(creep, intent.range, position);
        }
        if (canActivate) {
            creep.memory.intent = intent.name;
        }
    }
};
require('util_profiler').registerModule(module);

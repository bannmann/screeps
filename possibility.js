var intentsUtil = require("util_intents");
var moveAction = require("action_move");

module.exports = function(parameters) {
    var creep = parameters.creep;
    var intent = parameters.intent;
    var roomObject = parameters.roomObject;
    var shortDistanceFactor = parameters.shortDistanceFactor;
    var baseImportance = parameters.baseImportance;
    var preparationFunction = parameters.preparationFunction;
    var intentStatus = parameters.intentStatus || {};

    this.debug = { intentName: intent.name, intentStatus: intentStatus };

    var path;
    if (roomObject) {
        this.debug.targetPos = roomObject.pos;

        path = creep.pos.findPathTo(roomObject, {ignoreCreeps: true});
        var shortDistance = intentsUtil.getShortDistanceFactor(path, intent.range);
        this.importance = baseImportance + shortDistance * shortDistanceFactor;
    } else {
        this.importance = baseImportance;
    }

    this.choose = function() {
        creep.memory.intentStatus = intentStatus;
        if (preparationFunction) preparationFunction.call(parameters);
        activateIntent(intent);
    }

    function activateIntent(intent) {
        creep.memory.intent = intent.name;

        if (roomObject) {
            moveAction.start(creep, path, intent.range, roomObject.pos);
        }
    }
}

var lastTick = 0;
var messageNumber = 0;

module.exports.log = function(message) {
    if (lastTick != Game.time) {
        messageNumber = 0;
    }

    console.log(Game.time + "." + messageNumber + " " + message)

    messageNumber++;
    lastTick = Game.time;
};
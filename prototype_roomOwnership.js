module.exports.apply = function() {
    if (!Room.hasOwnProperty("my")) {
        Object.defineProperty(
            Room.prototype, "my", {
                get: function() {
                    var controller = this.controller;
                    return !!controller &&
                        (controller.my || !!controller.reservation && controller.reservation.username == Game.username);
                }
            });
    }

    if (!Room.hasOwnProperty("neutral")) {
        Object.defineProperty(
            Room.prototype, "neutral", {
                get: function() {
                    return !this.controller || !this.controller.owner && !this.controller.reservation;
                }
            });
    }
};
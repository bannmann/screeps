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

    if (!Room.hasOwnProperty("otherPlayer")) {
        Object.defineProperty(
            Room.prototype, "otherPlayer", {
                get: function() {
                    return !this.my && !this.neutral;
                }
            });
    }

    if (!Room.hasOwnProperty("username")) {
        Object.defineProperty(
            Room.prototype, "username", {
                get: function() {
                    var result = null;
                    if (this.controller) {
                        if (this.controller.owner) {
                            result = this.controller.owner.username;
                        }
                        else if (this.reservation) {
                            result = this.reservation.username;
                        }
                    }
                    return result;
                }
            });
    }
};
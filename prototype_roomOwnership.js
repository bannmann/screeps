module.exports.apply = function() {
    if (!Room.prototype.hasOwnProperty("my")) {
        Object.defineProperty(
            Room.prototype, "my", {
                get: function() {
                    var controller = this.controller;
                    return !!controller &&
                        (controller.my || !!controller.reservation && controller.reservation.username == Game.username);
                }
            });
    }

    if (!Room.prototype.hasOwnProperty("neutral")) {
        Object.defineProperty(
            Room.prototype, "neutral", {
                get: function() {
                    return !this.controller || !this.controller.owner && !this.controller.reservation;
                }
            });
    }

    if (!Room.prototype.hasOwnProperty("claimable")) {
        Object.defineProperty(
            Room.prototype, "claimable", {
                get: function() {
                    var controller = this.controller;
                    return !!controller && !controller.owner &&
                        (!controller.reservation || controller.reservation.username == Game.username);
                }
            });
    }

    if (!Room.prototype.hasOwnProperty("claimed")) {
        Object.defineProperty(
            Room.prototype, "claimed", {
                get: function() {
                    return !!this.controller && this.controller.my;
                }
            });
    }

    if (!Room.prototype.hasOwnProperty("otherPlayer")) {
        Object.defineProperty(
            Room.prototype, "otherPlayer", {
                get: function() {
                    return !this.my && !this.neutral;
                }
            });
    }

    if (!Room.prototype.hasOwnProperty("username")) {
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

    Room.prototype.abandon = function() {
        _.each(this.find(FIND_STRUCTURES), (structure) => { structure.destroy() } );
        _.each(this.find(FIND_MY_CREEPS), (creep) => { creep.suicide() } );
        _.each(this.find(FIND_CONSTRUCTION_SITES), (site) => { site.remove() } );
        this.controller.unclaim();
    };
};
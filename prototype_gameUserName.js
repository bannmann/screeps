var _ = require("lodash");

module.exports.apply = function() {
    if (!Game.hasOwnProperty("username")) {
        Object.defineProperty(
            Game, "username", {
                get: function() {
                    var anyCreep = this.creeps[Object.keys(this.creeps)[0]];
                    return anyCreep.owner.username;
                }
            });
    }
};
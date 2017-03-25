var _ = require("lodash");

module.exports.apply = function() {
    if (!Creep.prototype.hasOwnProperty("empty")) {
        Object.defineProperty(
            Creep.prototype, "empty", {
                get: function() {
                    return _.sum(this.carry) == 0;
                }
            });
    }
};
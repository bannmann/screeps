var _ = require("lodash");

module.exports.apply = function() {
    // Note the unusual camel casing - "parts" is lowercase, like in the stock method getActiveBodyparts()
    Creep.prototype.hasActiveBodyparts = function() {
        var result = true;
        _.each(arguments, (type) => {
            if (this.getActiveBodyparts(type) == 0) {
                result = false;
            }
        });
        return result;
    }

    if (!Creep.prototype.hasOwnProperty("canHeal")) {
        Object.defineProperty(
            Creep.prototype, "canHeal", {
                get: function() {
                    return this.hasActiveBodyparts(HEAL);
                }
            });
    }
};
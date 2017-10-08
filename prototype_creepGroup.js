var _ = require("lodash");

module.exports.apply = function() {
    if (!Creep.prototype.hasOwnProperty("idHash")) {
        Object.defineProperty(
            Creep.prototype, "idHash", {
                get: function() {
                    var result = this.memory.idHash;
                    if (!result) {
                        result = this.id.hashCode();
                        this.memory.idHash = result;
                    }
                    return result;
                }
            });
    }

    Creep.prototype.belongsToGroup = function(group, groupCount) {
        return this.idHash % groupCount == group;
    }
};
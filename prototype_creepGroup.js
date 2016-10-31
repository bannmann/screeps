var _ = require("lodash");

module.exports.apply = function() {
    // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    function calculateHash(string) {
        var hash = 0, i, chr, len;
        if (string.length === 0) return hash;
        for (i = 0, len = string.length; i < len; i++) {
            chr   = string.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    Object.defineProperty(
        Creep.prototype, "idHash", {
            get: function() {
                var result = this.memory.idHash;
                if (!result) {
                    result = calculateHash(this.id);
                    this.memory.idHash = result;
                }
                return result;
            }
        });

    Creep.prototype.belongsToGroup = function(group, groupCount) {
        return this.idHash % groupCount == group;
    }
};
module.exports.apply = function() {
    if (!Room.prototype.hasOwnProperty("hasOwnSpawns")) {
        Object.defineProperty(
            Room.prototype, "hasOwnSpawns", {
                get: function() {
                    var result = false;
                    if (this.controller && this.controller.my) {
                        result = this.find(FIND_MY_SPAWNS).length > 0;
                    }
                    return result;
                }
            });
    }
};
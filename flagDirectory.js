var logger = require("logger");

var data = {};

module.exports = {
    onTickStarting: function() {
        data.flags = {};

        _.each(Game.flags,
            (flag) => {
                var tokens = flag.name.split("=");
                var name = tokens[0];
                var value = tokens[1];
                data.flags[name] = { flag: flag, value: value };
            });
    },

    getFlagInfo: function(name) {
        return data.flags[name];
    }
};
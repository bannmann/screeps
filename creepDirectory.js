var logger = require("logger");

var data = {};

function increaseCounter(object, key) {
    if (!object[key]) {
        object[key] = 0;
    }
    object[key]++;
}

module.exports = {
    onTickStarting: function() {
        data.rooms = {};
        data.global = {};
        data.total = 0;

        _.each(Game.creeps,
            (creep) => {
                this.addCreep(creep.room.name, creep.memory.race);
            });

        // Allow humans to inspect the data easily
        Memory.CreepDirectory = data;
    },

    addCreep: function(roomName, raceName) {
        if (!data.rooms[roomName]) {
            data.rooms[roomName] = {};
        }

        var roomData = data.rooms[roomName];

        increaseCounter(roomData, raceName);
        increaseCounter(data.global, raceName);
        data.total++;
    },

    getGlobalRaceCount: function(raceName) {
        return data.global[raceName] || 0;
    },

    getRoomRaceCount: function(roomName, raceName) {
        var result = 0;
        if (roomName in data.rooms && raceName in data.rooms[roomName]) {
            result = data.rooms[roomName][raceName];
        }
        return result;
    },

    getOverallCount: function() {
        var result = 0;
        if (roomName in data.rooms && raceName in data.rooms[roomName]) {
            result = data.rooms[roomName][raceName];
        }
        return result;
    }
};
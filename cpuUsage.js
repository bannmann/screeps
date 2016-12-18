const HISTORY_LENGTH = 10;
const DEFAULT_CPU_LOAD = 0.7;

var logger = require("logger");
var flagDirectory = require("flagDirectory");

module.exports = {
    onTickStarting: function() {
        this.data = Memory.CpuUsage || {};

        if (!this.data.pastValues) {
            this.data.pastValues = [];
        }

        function mean(array) {
            var result = 0;
            if (array.length) {
                var sum = 0;
                _.each(
                    array, (value) => {
                        sum += value;
                    });
                result = sum / array.length;
            }
            return result;
        }

        var mean = mean(this.data.pastValues);

        this._isLow = mean <= this.getLimit();
    },

    getLimit: function() {
        var result = Game.cpu.limit * DEFAULT_CPU_LOAD;

        var flagInfo = flagDirectory.getFlagInfo("cpuLimit");
        if (flagInfo) {
            result = parseInt(flagInfo.value);
        }

        return result;
    },

    isLow: function() {
        return this._isLow;
    },

    afterTickEnding: function() {
        this.data.pastValues.push(Game.cpu.getUsed());
        while (this.data.pastValues.length > HISTORY_LENGTH) {
            this.data.pastValues.shift();
        }

        Memory.CpuUsage = this.data;
    }
};
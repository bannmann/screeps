var _ = require("lodash");

module.exports = {
    loadPath: function(root, pathArray, property) {
        var result = undefined;
        var current = root;
        _.each(pathArray, (pathSegment, index) => {
            var existingNextSegment = current[pathSegment];
            if (existingNextSegment) {
                current = existingNextSegment;
                if (index == pathArray.length - 1) {
                    result = current[property];
                }
            } else {
                return false;
            }
        });
        return result;
    },

    savePath: function(root, pathArray, property, value) {
        var current = root;
        _.each(pathArray, (pathSegment) => {
            if (!(pathSegment in current)) {
                current[pathSegment] = {};
            }
            current = current[pathSegment];
        });
        current[property] = value;
    },


    deletePath: function(root, pathArray, property) {
        var current = root;
        _.each(pathArray, (pathSegment, index) => {
            var existingNextSegment = current[pathSegment];
            if (existingNextSegment) {
                current = existingNextSegment;
                if (index == pathArray.length - 1) {
                    delete current[property];
                }
            }
        });
    }
};
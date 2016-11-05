module.exports = {
    getShortDistanceFactor: function(path, range) {
        return 1 / Math.max(1, path.length - range);
    }
};
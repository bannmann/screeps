var prototypes = require("prototypes");

module.exports.applyPrototypes = function() {
    prototypes.forEach((prototype) => prototype.apply());
};
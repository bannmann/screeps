var prototypes = require("prototypes");

module.exports.applyPrototypes = function() {
    _.each(prototypes, (prototype) => prototype.apply());
};
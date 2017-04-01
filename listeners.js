/**
 * Listener modules should not assume other listeners have run. While their invocation order is equivalent to the order
 * of this array, relying on that fact results in hidden temporal coupling, i.e. fragile code.
 *
 * Note that during listener events, modules should only update their internal state and memory. Making any changes to
 * the game world will likely mess with other, non-listener modules and make debugging harder.
 */
const LISTENER_MODULE_NAMES = [
    "creepDirectory",
    "flagDirectory",
    "enemyDirectory",
    "roomDirectory",
    "action_move",
    "cpuUsage",
    "util_paths"
];

const LISTENER_MODULES = _.map(LISTENER_MODULE_NAMES, require);

module.exports = {
    fireTickStarting: function() {
        this.callListeners("onTickStarting");
    },

    fireTickEnding: function() {
        this.callListeners("onTickEnding");
        this.callListeners("afterTickEnding");
    },

    callListeners: function(methodName) {
        _.each(LISTENER_MODULES,
            (listenerModule) => {
                if (methodName in listenerModule) {
                    listenerModule[methodName]();
                }
            });
    }
};
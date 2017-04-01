var logger = require("logger");
var Objects = require("util_objects");

module.exports = {
    isEnemy: function(username) {
        return this.isNpc(username) || this.isEnemyPlayer(username);
    },

    isNpc: function(username) {
        return username == "Invader" || username == "Source Keeper";
    },

    isEnemyPlayer: function(username) {
        return !!username && !this.isAlliedPlayer(username);
    },

    isAlliedPlayer: function(username) {
        return this.isAllianceMember(username) || this.isFriend(username);
    },

    isAllianceMember: function(username) {
        return this.playerListIncludes("allianceMembers", username);
    },

    isFriend: function(username) {
        return this.playerListIncludes("friends", username);
    },

    playerListIncludes: function(listName, username) {
        var list = Objects.loadPath(Memory, ["PlayerDirectory"], listName) || [];
        return list.includes(username);
    },

    getList: function(listName) {
        return Objects.loadPath(Memory, ["PlayerDirectory"], listName);
    },

    addToList: function(listName, usernameArg) {
        var list = this.getList(listName) || [];
        var result = [];

        function add(username) {
            if (!list.includes(username)) {
                list.push(username);
                result.push(username);
            }
        }

        if (_.isArray(usernameArg)) {
            _.each(usernameArg, add);
        } else {
            add(usernameArg);
        }

        this.saveList(listName, list);
        return result;
    },

    clearList: function(listName) {
        this.saveList(listName, []);
    },

    saveList: function(listName, list) {
        Objects.savePath(Memory, ["PlayerDirectory"], listName, list);
    },

    removeFromList: function(listName, usernameArg) {
        var list = Objects.loadPath(Memory, ["PlayerDirectory"], listName) || [];

        var predicate;
        if (_.isArray(usernameArg)) {
            predicate = (username) => usernameArg.includes(username);
        } else {
            predicate = (username) => username == usernameArg;
        }

        return _.remove(list, predicate);
    }
};
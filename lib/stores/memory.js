/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Strings     = require("../strings"),
    util        = require("../util"),
    async       = require("async");

function setItems(type, man, items, override, done) {
    if (typeof override === "function") {
        done = override;
        override = null;
    }

    if (!done) {
        done = function (err) {
            if (err) {
                throw err;
            }
        };
    }

    function setItem(item, cb) {
        if (!override && man[type][item.name]) {
            return cb(new Error(Strings.ERR_RULE_EXISTS));
        }

        man[type][item.name] = item;
        cb();
    }

    if (Array.isArray(items)) {
        async.each(items, function (item, callback) {
            setItem(item, callback);
        }, done);
    } else {
        setItem(items, done);
    }
}

function delItems(type, man, names, done) {
    if (!done) {
        done = function (err) {
            if (err) {
                throw err;
            }
        };
    }

    function remItem(name, cb) {
        delete man[type][name];
        cb();
    }

    if (Array.isArray(names)) {
        async.each(names, function (item, callback) {
            remItem(item, callback);
        }, done);
    } else {
        remItem(names, done);
    }
}

function getItemsNames(type, man, start, count, match, done) {
    var keys    = Object.keys(man[type]),
        res     = [],
        regex;

    if (match) {
        regex = util.regExpFromWildExp(match);
        keys = keys.filter(function (el) {
            return regex.test(el);
        });
    }

    if (start || count) {
        if (count) {
            count = start + count;
        } else {
            count = undefined;
        }
        keys = keys.splice(start, count);
    }

    keys.forEach(function (key) {
        var item = man[type][key];
        res.push({ name: item.name, description: item.description });
    });

    done(null, res);
}

/**
 * Constructor for Memory rule store.
 *
 * This store keeps rules in memory only.
 * Rules are not persisted across application reloads and therefore they have to be loaded early in the application start (initialization) phase.
 *
 * Options
 *
 *  - `name` {string}, the name of the store. The default value is "memory". NOTE: every store is required to have a unique name within a manager.
 *
 * This is the default store for authority and it doesn’t have to be explicitly configured unless it is used in conjunction with other stores.
 *
 * @example
 *  var authority = require("authority");
 *
 *  authority.setRules([{
 *          name: "allow_managers_only",
            description: "Only managers can pass.",
            condition: { title: "Manager" }
 *      }, {
 *          name: "allow_teenagers_only",
            description: "Only users between 13 and 19 years old can pass.",
            condition: { age: { $gte: 13, $lte: 19 } }
 *      }
 *  ]);
 *
 * @class Represents a Memory rule store.
 * @param {object=} opts - Additional options.
 */
function MemoryStore(opts) {
    if (!opts) {
        opts = {};
    }

    /**
     * The name of this store. The default value is "memory". NOTE: every store is required to have a unique name within a manager.
     */
    this.name = opts.name || "memory";

    /**
     * The object that holds the references to all stored rules. NOTE: this member is not part of the Authority API and it is specific to this store only.
     */
    this.rules = {};

    /**
     * The object that holds the references to all stored ACLs (Access Control Lists). NOTE: this member is not part of the Authority API and it is specific to this store only.
     */
    this.acls = {};
}

/**
 * Adds one or more rules to the store.
 *
 * @param {(object|object[])} rules - The rule or an array of rules to be added to the store.
 *
 * @param {boolean=} override - Specifies whether existing rules should be replaced by the ones provided to this method. Rules are matched by their name.
 * If this parameter is not specified or is false and there is a name conflict an error will be returned or thrown depending on the usage of the method.
 *
 * @param {function=} done - Optional callback function that will be called after the rule(s) have been added.
 * If the method is unsuccessful an error object will be passed as a single parameter to the callback.
 * If the callback is omitted and the method is unsuccessful an error will be thrown.
 *
 * @return {null}
 */
MemoryStore.prototype.setRules = function (rules, override, done) {
    setItems("rules", this, rules, override, done);
};

/**
 * Retrieves the specified rule from the store.
 *
 * @param {string} name - The name of the rule.
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain the requested rule or null if not found.
 * @return {null}
 */
MemoryStore.prototype.getRule = function (name, done) {
    done(null, this.rules[name]);
};

/**
 * Removes the specified rules from the store.
 *
 * @param {(string|string[])} names - The name or an array of names to remove.
 * @param {function=} done - Optional callback function that will be called after the rule(s) have been deleted.
 * If the method is unsuccessful an error object will be passed as a single parameter to the callback.
 * If the callback is omitted and the method is unsuccessful an error will be thrown.
 * @return {null}
 */
MemoryStore.prototype.deleteRules = function (names, done) {
    delItems("rules", this, names, done);
};

/**
 * Retrieves the names and descriptions of the rules present in the store and matching the specified criteria.
 *
 * All parameters are required.
 *
 * @param {number} start - The index at wich to begin retrieving names. The index of the first element is 0.
 * @param {number} count - The number of names to retrieve. `0` denotes all remaining.
 * @param {string} match - Wildcard expression to match names. `null` denotes any name. Example: `allow_*`
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain an array of matched objects `{ name: "string", description: "string" }`.
 */
MemoryStore.prototype.getRuleNames = function (start, count, match, done) {
    getItemsNames("rules", this, start, count, match, done);
};

/**
 * Gets the total count of rules present in the store.
 *
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain a number representing the total count of rules.
 */
MemoryStore.prototype.getRuleCount = function (done) {
    done(null, Object.keys(this.rules).length);
};

/**
 * Adds one or more ACL (Access Control List) to the store.
 *
 * @param {(object|object[])} acls - The ACL or an array of ACLs to be added to the store.
 *
 * @param {boolean=} override - Specifies whether existing ACLs should be replaced by the ones provided to this method. ACLs are matched by their name.
 * If this parameter is not specified or is false and there is a name conflict an error will be returned or thrown depending on the usage of the method.
 *
 * @param {function=} done - Optional callback function that will be called after the ACL(s) have been added.
 * If the method is unsuccessful an error object will be passed as a single parameter to the callback.
 * If the callback is omitted and the method is unsuccessful an error will be thrown.
 *
 * @return {null}
 */
MemoryStore.prototype.setAcls = function (acls, override, done) {
    setItems("acls", this, acls, override, done);
};

/**
 * Retrieves the specified ACL from the store.
 *
 * @param {string} name - The name of the ACL.
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain the requested ACL or null if not found.
 * @return {null}
 */
MemoryStore.prototype.getAcl = function (name, done) {
    done(null, this.acls[name]);
};

/**
 * Removes the specified ACLs from the store.
 *
 * @param {(string|string[])} names - The name or an array of names to remove.
 * @param {function=} done - Optional callback function that will be called after the ACL(s) have been deleted.
 * If the method is unsuccessful an error object will be passed as a single parameter to the callback.
 * If the callback is omitted and the method is unsuccessful an error will be thrown.
 * @return {null}
 */
MemoryStore.prototype.deleteAcls = function (names, done) {
    delItems("acls", this, names, done);
};

/**
 * Retrieves the names and descriptions of the ACLs present in the store and matching the specified criteria.
 *
 * All parameters are required.
 *
 * @param {number} start - The index at wich to begin retrieving names. The index of the first element is 0.
 * @param {number} count - The number of names to retrieve. `0` denotes all remaining.
 * @param {string} match - Wildcard expression to match names. `null` denotes any name. Example: `allow_*`
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain an array of matched objects `{ name: "string", description: "string" }`.
 */
MemoryStore.prototype.getAclNames = function (start, count, match, done) {
    getItemsNames("acls", this, start, count, match, done);
};

/**
 * Gets the total count of ACLs present in the store.
 *
 * @param {function} done - The callback that handles the result.
 * The first parameter will always be null for this store while the second parameter will contain a number representing the total count of ACLs.
 */
MemoryStore.prototype.getAclCount = function (done) {
    done(null, Object.keys(this.acls).length);
};

module.exports = MemoryStore;

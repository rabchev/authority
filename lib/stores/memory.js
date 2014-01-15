/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Strings     = require("../strings"),
    util        = require("../util"),
    async       = require("async");

/**
 * Constructor for Memory rule store.
 *
 * This store keeps rules in memory only.
 * Rules are not persisted across application reloads and therefore they have to be loaded early in the application start (initialization) phase.
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
 */
function MemoryStore() {
    this.name = "memory";
    this.rules = {};
}

/**
 * Adds one or more rules to the store.
 *
 * @param {(object|object[]])} rules - The rule or an array of rules to be added to the store.
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
    var that = this;

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

    function setRule(rule, cb) {
        if (!override && that.rules[rule.name]) {
            return cb(new Error(Strings.ERR_RULE_EXISTS));
        }

        that.rules[rule.name] = rule;
        cb();
    }

    if (Array.isArray(rules)) {
        async.each(rules, function (item, callback) {
            setRule(item, callback);
        }, done);
    } else {
        setRule(rules, done);
    }
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
    var that = this;

    if (!done) {
        done = function (err) {
            if (err) {
                throw err;
            }
        };
    }

    function remRule(name, cb) {
        delete that.rules[name];
        cb();
    }

    if (Array.isArray(names)) {
        async.each(names, function (item, callback) {
            remRule(item, callback);
        }, done);
    } else {
        remRule(names, done);
    }
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
    var keys    = Object.keys(this.rules),
        res     = [],
        that    = this,
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
        var rule = that.rules[key];
        res.push({ name: rule.name, description: rule.description });
    });

    done(null, res);
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

module.exports = MemoryStore;

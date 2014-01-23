/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, sloppy: true, es5: true, indent: 4, maxerr: 50 */

"use strict";

var sift            = require("sift"),
    util            = require("./util"),
    Strings         = require("./strings");

function execCond(cond, fact, man, cb) {
    switch (typeof cond) {
    case "function":
        try {
            cond(fact, cb);
        } catch (err1) {
            cb(err1);
        }
        break;
    case "string":
        man.getRule(cond, function (err, rule) {
            if (err) {
                return cb(err);
            }
            execRule(rule, fact, man, cb);
        });
        break;
    default:
        var res;
        try {
            res = sift(cond).test(fact);
        } catch (err2) {
            return cb(err2);
        }
        cb(null, res);
        break;
    }
}

function execRule(rl, fact, man, cb) {
    var cond = rl.condition;
    if (!cond) {
        cond = rl;
    }
    if (Array.isArray(cond)) {
        var completed   = 0,
            iterate     = function () {
                execCond(cond[completed++], fact, man, function (err, res) {
                    if (err || !res || completed >= cond.length) {
                        cb(err, res);
                    } else {
                        iterate();
                    }
                });
            };

        iterate();
    } else {
        execCond(cond, fact, man, cb);
    }
}

function setStore(store, mngr, acl) {
    if (store) {
        if (typeof store.store === "string") {
            store = util.createStore(store.store, store.options);
        }
        if (acl) {
            mngr.stores.acl = store;
        } else {
            mngr._strArr.push(store);
            mngr.stores[store.name] = store;
        }
    }
}

/**
 * Constructor for Authority Manager.
 *
 * Options
 *
 *  - `ruleStore` {object/function}<optional>, configuration object or an instance of rules store.
 *  - `ruleStores` {object[]/function[]}<optional>, an array of configuration objects or instances of rule stores.
 *  - `defaultStore` {string}<optional>, specifies the default rule store for the manager. This option is applicable only if the manager is set to work with multiple rule stores. If this option is omitted the first store in the collection is assumed.
 *  - `aclStore` {(object/function)}<optional>, configuration object or an instance of ACL (Access Control List) store.
 *
 * All options are optional. If no rule or ACL store is specified, the {@link MemoryStore} is used.
 *
 * The configuration of stores takes the following form:
 *
 * @example
 *  {
 *      ruleStores: [
 *          // Use memory store with default options. If the store property is string it is resolved with require and options property is passed as an argument.
 *          { store: "memory", options: {} },
 *          // Use Redis store. Options are store specific.
 *          { store: "redis", options: { host: "redis.mydomain.com" } }
 *      ],
 *      defaultStore: "redis",
 *      aclStore: { store: "redis", options: { host: "redis.mydomain.com" } }
 *  }
 *
 * @class Represents an Authority Manager.
 * @param {object=} opts - Additional options described above.
 */
function Manager(opts) {
    var that = this;

    this._strArr = [];
    this.stores = {};

    if (!opts) {
        opts = {};
    }

    if (opts.ruleStore) {
        setStore(opts.ruleStore, this);
    }

    if (opts.ruleStores) {
        opts.ruleStores.forEach(function (el) {
            setStore(el, that);
        });
    }

    if (this._strArr.length === 0) {
        setStore({ store: "./stores/memory" }, this);
    }

    if (!opts.defaultStore) {
        this.defaultStore = this._strArr[0].name;
    }

    setStore(opts.aclStore || { store: "./stores/memory", options: { name: "acl" } }, this, true);
}

/**
 * Adds one or more rules to the default store.
 *
 * This method is simply alias to the `setRules` method of the default store.
 * If default store hasn't been set explicitly, the first store in the collection is assumed.
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
Manager.prototype.setRules = function (rules, override, done) {
    this.stores[this.defaultStore].setRules(rules, override, done);
};

/**
 * Retrieves the specified rule from the first store that matches the name.
 *
 * @param {string} name - The name of the rule.
 * @param {function} done - The callback that handles the result.
 * The first parameter will be an error object if an error occurred, or null otherwise.
 * The second parameter will contain the requested rule or null if not found.
 * @return {null}
 */
Manager.prototype.getRule = function (name, done) {
    var getters     = this._strArr,
        completed   = 0,
        iterate     = function () {
            getters[completed++].getRule(name, function (err, rule) {
                if (err || rule || completed >= getters.length) {
                    done(err, rule);
                } else {
                    iterate();
                }
            });
        };

    iterate();
};

/**
 * Executes the specified or provided rule.
 *
 * @param {(string|object)} rule - The name of a rule or an instance of a rule.
 * @param {object} fact - An object containing facts to which the current rule is matched against.
 * @param {function} done - Callback function that will be called after the rule has been evaluated.
 * The first parameter will be an error object if an error occurred, or null otherwise.
 * The second parameter will contain `true` or `false` indicating whether all conditions against the provided fact have been satisfied, including all conditions from all nested rules if any.
 * @return {null}
 */
Manager.prototype.execute = function (rule, fact, done) {
    if (!done) {
        throw new Error(Strings.ERR_REQUIRED_CALLBACK);
    }
    if (!rule || !fact) {
        return done(new Error(Strings.ERR_REQ_RULE_FACT));
    }

    var that = this;
    if (typeof rule === "string") {
        return this.getRule(rule, function (err, rl) {
            if (err) {
                return done(err);
            }
            execRule(rl, fact, that, done);
        });
    }
    execRule(rule, fact, that, done);
};

module.exports = Manager;

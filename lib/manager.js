/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, sloppy: true, indent: 4, maxerr: 50 */

"use strict";

var sift            = require("sift"),
    Strings         = require("./strings");

function execCond(cond, fact, cb, man) {
    switch (typeof cond) {
    case "function":
        cond(fact, cb);
        break;
    case "string":
        man.getRule(cond, function (err, rule) {
            if (err) {
                return cb(err);
            }
            execRule(rule, fact, cb, man);
        });
        break;
    default:
        try {
            cb(null, sift(cond).test(fact));
        } catch (err) {
            cb(err);
        }
        break;
    }
}

function execRule(rl, fact, cb, man) {
    if (Array.isArray(rl.condition)) {

    } else {
        execCond(rl.condition, fact, cb, man);
    }
}

function Manager(opts, stores) {
    this.stores = {};
    this.opts = opts || {};

    if (!stores) {
        stores = [new (require("./stores/memory"))()];
    } else if (!Array.isArray(stores)) {
        stores = [stores];
    }

    if (!this.opts.defaultStore) {
        this.opts.defaultStore = stores[0].name;
    }

    stores.forEach(function (el) {
        this.stores[el.name] = el;
    });

    this._stores = stores;
}

Manager.prototype.setRule = function (rule) {
    this.stores[this.opts.defaultStore].setRule(rule);
};

Manager.prototype.getRule = function (name, done) {
    var getters     = this._stores,
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

Manager.prototype.execute = function (rule, fact, done) {
    if (!done) {
        throw new Error(Strings.ERR_REQUIRED_CALLBACK);
    }
    if (!rule || fact) {
        return done(new Error(Strings.ERR_REQ_RULE_FACT));
    }

    var that = this;
    if (typeof rule === "string") {
        return this.getRule(rule, function (err, rl) {
            if (err) {
                return done(err);
            }
            execRule(rl, fact, done, that);
        });
    }
    execRule(rule, fact, done, that);
};

module.exports = Manager;

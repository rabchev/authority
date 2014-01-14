/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Strings     = require("../strings"),
    util        = require("../util"),
    async       = require("async");

function MemoryStore() {
    this.name = "memory";
    this.rules = {};
}

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

MemoryStore.prototype.getRule = function (name, done) {
    done(null, this.rules[name]);
};

MemoryStore.prototype.deleteRules = function (names, done) {
    var that = this;

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

MemoryStore.prototype.getRuleCount = function (done) {
    done(null, Object.keys(this.rules).length);
};

module.exports = MemoryStore;

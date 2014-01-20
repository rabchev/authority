/*jshint expr:true */
/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, es5: true, indent: 4, maxerr: 50 */
/*global it */

"use strict";

//debugger;

var chai            = require("chai"),
    expect          = chai.expect,
    Strings         = require("../lib/strings");

exports.getSuit = function (store) {
    return function () {
        it("set single rule", function (done) {
            store.setRules({
                name: "allow_testuser_only",
                description: "Only testuser can pass.",
                condition: function (fact, cb) {
                    cb(null, fact && fact.username === "testuser");
                }
            }, function (err) {
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("set multiple rules", function (done) {
            store.setRules([{
                name: "allow_teenagers_only",
                description: "Only users between 13 and 19 years old can pass.",
                condition: { age: { $gte: 13, $lte: 19 } }
            }, {
                name: "allow_managers_only",
                description: "Only managers can pass.",
                condition: { title: "Manager" }
            }, {
                name: "allow_specific_roles",
                description: "Only members of Admins, Power Users and Contributers can pass.",
                condition: { roles: { $in: ["Admins", "Power Users", "Contributers"] } }
            }], function (err) {
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("get rule", function (done) {
            store.getRule("allow_testuser_only", function (err, rule) {
                expect(err).to.not.be.ok;
                expect(rule.description).to.equal("Only testuser can pass.");
                done();
            });
        });

        it("get rule count", function (done) {
            store.getRuleCount(function (err, count) {
                expect(err).to.not.be.ok;
                expect(count).to.equal(4);
                done();
            });
        });

        it("should return error on existing rule", function (done) {
            store.setRules({
                name: "allow_testuser_only",
                description: "Replace rule.",
                condition: {}
            }, function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal(Strings.ERR_ITEM_EXISTS);
                done();
            });
        });

        it("replace rule", function (done) {
            store.setRules({
                name: "allow_testuser_only",
                description: "Replaced Rule (Allow testuser Only).",
                condition: function (fact, cb) {
                    cb(null, fact && fact.username === "testuser");
                }
            }, true, function (err) {
                expect(err).to.not.be.ok;
                store.getRule("allow_testuser_only", function (err2, res) {
                    expect(err2).to.not.be.ok;
                    expect(res.description).to.equal("Replaced Rule (Allow testuser Only).");
                    done();
                });
            });
        });

        it("get all rule names", function (done) {
            store.getRuleNames(0, 0, null, function (err, rules) {
                expect(err).to.not.be.ok;
                expect(rules.length).to.equal(4);
                expect(rules[0].name).to.equal("allow_testuser_only");
                expect(rules[3].name).to.equal("allow_specific_roles");
                done();
            });
        });

        it("get first two rule names", function (done) {
            store.getRuleNames(0, 2, null, function (err, rules) {
                expect(err).to.not.be.ok;
                expect(rules.length).to.equal(2);
                expect(rules[0].name).to.equal("allow_testuser_only");
                expect(rules[1].name).to.equal("allow_teenagers_only");
                done();
            });
        });

        it("get last two rule names", function (done) {
            store.getRuleNames(2, 2, null, function (err, rules) {
                expect(err).to.not.be.ok;
                expect(rules.length).to.equal(2);
                expect(rules[0].name).to.equal("allow_managers_only");
                expect(rules[1].name).to.equal("allow_specific_roles");
                expect(rules[1].description).to.equal("Only members of Admins, Power Users and Contributers can pass.");
                done();
            });
        });

        it("get filtered rule names", function (done) {
            store.getRuleNames(0, 0, "*_only", function (err, rules) {
                expect(err).to.not.be.ok;
                expect(rules.length).to.equal(3);
                expect(rules[0].name).to.equal("allow_testuser_only");
                expect(rules[1].name).to.equal("allow_teenagers_only");
                expect(rules[2].name).to.equal("allow_managers_only");
                done();
            });
        });

        it("get first two filtered rule names", function (done) {
            store.getRuleNames(0, 2, "*_only", function (err, rules) {
                expect(err).to.not.be.ok;
                expect(rules.length).to.equal(2);
                expect(rules[0].name).to.equal("allow_testuser_only");
                expect(rules[1].name).to.equal("allow_teenagers_only");
                done();
            });
        });

        it("delete single rule", function (done) {
            store.deleteRules("allow_testuser_only", function (err) {
                expect(err).to.not.be.ok;
                store.getRule("allow_testuser_only", function (err, rule) {
                    expect(err).to.not.be.ok;
                    expect(rule).to.not.be.ok;
                    done();
                });
            });
        });

        it("delete multiple rules", function (done) {
            store.deleteRules([
                "allow_teenagers_only",
                "allow_managers_only",
                "allow_specific_roles"
            ], function (err) {
                expect(err).to.not.be.ok;
                store.getRuleCount(function (err, count) {
                    expect(err).to.not.be.ok;
                    expect(count).to.equal(0);
                    done();
                });
            });
        });

        it("set single ACL", function (done) {
            store.setAcls({
                name: "article:1001",
                operation: {
                    modify: {
                        deny: {},
                        allow: {
                            contributers: true,
                            maintainers: true,
                            "users:bob": true
                        }
                    },
                    view: {
                        allow: { visitors: true }
                    }
                }
            }, function (err) {
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("set multiple ACLs", function (done) {
            store.setAcls([{
                name: "blogs",
                description: "ACL for Blogs section.",
                operation: { add: { allow: { contributers: true } } }
            }, {
                name: "admin",
                description: "ACL for administrative area.",
                operation: { "delete": { allow: { maintainers: true } } }
            }, {
                name: "allow_downloads",
                description: "Only members of Admins, Power Users and Contributers can pass.",
                operation: { "delete": { allow: { maintainers: true } } }
            }], function (err) {
                expect(err).to.not.be.ok;
                done();
            });
        });

        it("get ACL", function (done) {
            store.getAcl("article:1001", function (err, acl) {
                expect(err).to.not.be.ok;
                expect(acl.operation.view.allow.visitors).to.equal(true);
                done();
            });
        });

        it("get ACL count", function (done) {
            store.getAclCount(function (err, count) {
                expect(err).to.not.be.ok;
                expect(count).to.equal(4);
                done();
            });
        });

        it("should return error on existing ACL", function (done) {
            store.setAcls({
                name: "article:1001",
                description: "Replace rule.",
                operation: { add: { allow: { contributers: true } } }
            }, function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal(Strings.ERR_ITEM_EXISTS);
                done();
            });
        });

        it("replace ACL", function (done) {
            store.setAcls({
                name: "article:1001",
                description: "Replaced ACL.",
                operation: {
                    modify: {
                        deny: {},
                        allow: {
                            contributers: true,
                            maintainers: true,
                            "users:bob": true
                        }
                    },
                    view: {
                        allow: { visitors: true }
                    }
                }
            }, true, function (err) {
                expect(err).to.not.be.ok;
                store.getAcl("article:1001", function (err, res) {
                    expect(err).to.not.be.ok;
                    expect(res.description).to.equal("Replaced ACL.");
                    done();
                });
            });
        });

        it("get all ACL names", function (done) {
            store.getAclNames(0, 0, null, function (err, names) {
                expect(err).to.not.be.ok;
                expect(names.length).to.equal(4);
                expect(names[0].name).to.equal("article:1001");
                expect(names[3].name).to.equal("allow_downloads");
                done();
            });
        });

        it("get first two ACL names", function (done) {
            store.getAclNames(0, 2, null, function (err, names) {
                expect(err).to.not.be.ok;
                expect(names.length).to.equal(2);
                expect(names[0].name).to.equal("article:1001");
                expect(names[1].name).to.equal("blogs");
                done();
            });
        });
    };
};

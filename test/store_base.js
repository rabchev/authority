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

        it("should return error on existing", function (done) {
            store.setRules({
                name: "allow_testuser_only",
                description: "Should Throw.",
                condition: {}
            }, function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal(Strings.ERR_RULE_EXISTS);
                done();
            });
        });
    };
};

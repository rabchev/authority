/*jshint expr:true */
/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, es5: true, indent: 4, maxerr: 50 */
/*global describe, it */

"use strict";

debugger;

var chai            = require("chai"),
    sinonChai       = require("sinon-chai"),
    expect          = chai.expect,
    Manager         = require("../lib/manager"),
    users           = [
        {
            name: "bob",
            title: "product manager",
            age: 55,
            roles: [
                "contributers",
                "moderators"
            ]
        },
        {
            name: "john",
            title: "designer",
            age: 25,
            roles: [
                "designers",
                "team leads"
            ]
        },
        {
            name: "sasha",
            title: "costumer advocate",
            age: 55,
            roles: [
                "users",
                "costumer advocates"
            ]
        }
    ],
    manager;

chai.use(sinonChai);

describe("manager", function () {
    it("exec direct rule", function (done) {
        manager = new Manager();
        manager.execute({
            condition: function (fact, callback) {
                expect(fact).to.be.eql(users[1]);
                callback(null, true);
            }
        }, users[1], function (err, res) {
            expect(err).to.be.null;
            expect(res).to.be.true;
            done();
        });
    });

    it("exec direct condition", function (done) {
        manager.execute(function (fact, callback) {
            expect(fact).to.be.eql(users[1]);
            callback(null, true);
        }, users[1], function (err, res) {
            expect(err).to.be.null;
            expect(res).to.be.true;
            done();
        });
    });

    it("exec declarative condition", function (done) {
        manager.execute({
            title: "designer",
            age: { $gt: 20, $lt: 30}
        }, users[1], function (err, res) {
            expect(err).to.be.null;
            expect(res).to.be.true;
            done();
        });
    });

    it("exec declarative condition false", function (done) {
        manager.execute({
            title: "designer",
            age: { $gt: 20, $lt: 25}
        }, users[1], function (err, res) {
            expect(err).to.be.null;
            expect(res).to.be.false;
            done();
        });
    });

    it("exec declarative rule", function (done) {
        manager.execute({
            "name": "muts_be_team_lead",
            "description": "Only team leades are allowed.",
            "condition": {
                "$and": [
                    { "roles": { "$in": ["team leads"] }},
                    { "roles": { "$nin": ["costumer advocates"] }}
                ]
            }
        }, users[1], function (err, res) {
            expect(err).to.be.null;
            expect(res).to.be.true;
            done();
        });
    });

    it("exec declarative rule with multiple conditions", function (done) {
        manager.execute(
            {
                name: "rule_1",
                condition: [
                    {
                        title: "designer"
                    },
                    {
                        age: "25"
                    }
                ]
            },
            users[1],
            function (err, res) {
                expect(err).to.be.null;
                expect(res).to.be.true;
                done();
            }
        );
    });

    it("exec rule with mixed conditions", function (done) {
        manager.execute(
            {
                name: "rule_1",
                condition: [
                    {
                        title: "designer"
                    },
                    function (fact, callback) {
                        callback(null, fact.age === 25);
                    }
                ]
            },
            users[1],
            function (err, res) {
                expect(err).to.be.null;
                expect(res).to.be.true;
                done();
            }
        );
    });

    it("exec directly mixed conditions", function (done) {
        manager.execute(
            [
                {
                    title: "designer"
                },
                function (fact, callback) {
                    callback(null, fact.age === 10);
                }
            ],
            users[1],
            function (err, res) {
                expect(err).to.be.null;
                expect(res).to.be.false;
                done();
            }
        );
    });

    it("exec condition with error", function (done) {
        manager.execute(function (fact, callback) {
            throw new Error("Test Error");
        }, users[1], function (err, res) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal("Test Error");
            expect(res).to.not.be.ok;
            done();
        });
    });

    it("exec declarative condition with error", function (done) {
        manager.execute({
            $in: 0
        }, users[1], function (err, res) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal("Object 0 has no method 'indexOf'");
            expect(res).to.not.be.ok;
            done();
        });
    });
});

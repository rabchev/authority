/*jshint expr:true */
/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, es5: true, indent: 4, maxerr: 50 */
/*global describe, it */

"use strict";

//debugger;

var chai            = require("chai"),
    sinonChai       = require("sinon-chai"),
    expect          = chai.expect,
    authority       = require("../lib/authority");

chai.use(sinonChai);

describe("authority", function () {
    it("set store", function () {
        authority.init();
        expect(authority.opts).to.be.ok;
    });

    it("foo", function () {
        expect(true).to.be.true;
    });

    it("bar", function () {
        expect(authority.sotre).to.not.be.ok;
    });
});

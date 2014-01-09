/*jshint expr:true */
/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, es5: true, indent: 4, maxerr: 50 */
/*global describe, it */

"use strict";
debugger;
var expect          = require("chai").expect,
    authority    = require("../lib/authority");

describe("authority", function () {
    it("set store", function () {
        authority.set();
        expect(authority.opts).to.be.ok;
    });

    it("foo", function () {
        expect(true).to.be.true;
    });

    it("bar", function () {
        expect(authority.sotre).to.not.be.ok;
    });
});

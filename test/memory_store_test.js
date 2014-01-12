/*jshint expr:true */
/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, es5: true, indent: 4, maxerr: 50 */
/*global describe */

"use strict";

debugger;

var baseSuit        = require("./store_base"),
    Store           = require("../lib/stores/memory");

describe("memory store", baseSuit.getSuit(new Store()));

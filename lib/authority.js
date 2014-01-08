/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Manager         = require("./manager"),
    _               = require("lodash");

exports.createManager = function (opts, store) {
    return new Manager(opts, store);
};

exports.set = function (opts, store) {
    var manager = new Manager(opts, store);

    _.extend(exports, manager);
    _.mixin(exports, manager);
};

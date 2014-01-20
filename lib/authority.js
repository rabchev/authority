/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Manager         = require("./manager"),
    Strings         = require("./strings"),
    _               = require("lodash");

function createManager(opts) {
    return new Manager(opts);
}

function configure(opts) {
    var k;
    for (k in exports) {
        delete exports[k];
    }

    exports.manager = createManager(opts);

    _.extend(exports, exports.manager);
    _.mixin(exports, exports.manager);
    assign();
}

function assign() {
    exports.createManager   = createManager;
    exports.configure       = configure;
}

configure();

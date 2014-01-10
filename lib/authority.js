/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var Manager         = require("./manager"),
    Strings         = require("./strings"),
    _               = require("lodash");

function isInitialized() {
    return !!exports.manager;
}

function createManager(opts, stores) {
    return new Manager(opts, stores);
}

function init(opts, stores, replace) {
    var k;

    if (isInitialized()) {
        if (!replace) {
            throw new Error(Strings.ERR_ALREADY_INIT);
        }

        exports.manager.dispose();
        for (k in exports) {
            delete exports[k];
        }
    }

    exports.manager = createManager(opts, stores);

    _.extend(exports, exports.manager);
    _.mixin(exports, exports.manager);
    assign();
}

function assign() {
    exports.createManager   = createManager;
    exports.isInitialized   = isInitialized;
    exports.init            = init;
}

assign();

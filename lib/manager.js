/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, sloppy: true, indent: 4, maxerr: 50 */

"use strict";

function Manager(opts, store) {
    this.opts = opts || {};
    this.store = store;
}

module.exports = Manager;

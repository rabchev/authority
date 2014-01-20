/*jslint plusplus: true, devel: true, nomen: true, vars: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var strings = {
    /**
     * Errors
     */
    "ERR_ALREADY_INIT"          : "Authority is already initialized. If you want to override the current setup provide replace argument.",
    "ERR_REQ_RULE_FACT"         : "The rule and fact arguments are required.",
    "ERR_REQ_CALLBACK"          : "Callback function is required.",
    "ERR_ITEM_EXISTS"           : "An item with this name already exists. Please specify override argument if you want to replace the existing item."
};

module.exports = strings;

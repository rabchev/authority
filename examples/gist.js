/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

var authority = require("../lib/authority"),
    RedisStore = require("../stores/redis"),
    RedisClient = require("redis-client"),
    manager = authority.createManager({}, new RedisStore(new RedisClient({})));



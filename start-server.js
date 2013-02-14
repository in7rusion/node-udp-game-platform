var properties = require("./game-server.properties").Properties,
    serverlib = require("./lib/server"),
    gamelib = require("./lib/engine"),
    u_ = require("underscore"),
    util = require("util");

var engine = new gamelib.GameEngine(properties);
var server = new serverlib.GameServer(engine, properties);

server.start();

var protocols = require("./protocols").protocols,
    udpc = require("./udp-connector"),
    u_ = require("underscore"),
    util = require("util");

/**
 * Game server.
 * 
 * @author tkisiel
 */
exports.GameServer = function(engine, conf) {
    var self = this;
    var connector = new udpc.UdpConnector(conf);
    var protocol = protocols[conf.protocol.game];
    var userMgr = new exports.UserManager();
    
    // ACTIONS
    var actions = {
        /**
         * @param data { uid, host, port }
         */
        watch: function(data) {
            data.client = connector.connect(data.host, data.port);
            userMgr.addSpectator(data);
            sendStatus(data.client);
        },
        /**
         * @param data { uid, host, port }
         */
        join: function(data) {
            data.client = connector.connect(data.host, data.port);
            userMgr.addPlayer(data);
            sendStatus(data.client);
        },
    };
    function callAction(name, data) {
        try {
            var action = actions[name];
            if (action) action.call(self, data);
            engine.emit(name, data);
        } catch (e) {
            console.log("Action failed: " + e);
        }
    }

    // INFRASTRUCTURE
    self.start = function() {
        connector.listen(conf.port, {
            onMessage: function(msg, rinfo) {
                var data = protocol.decode(msg);
                data.host = data.host || rinfo.address;
                callAction(data.action, data);
            },
        });
    };
    self.stop = function() {
        engine.emit("stop");
        self.shutDown();
    };

    // COMMUNICATION
    engine.on("send", function(uid, data) {
        var user = userMgr.get(uid);
        if (user) user.client.send(protocol.encode(data));
    });
    engine.on("broadcast", function(data) {
        userMgr.spectators().forEach(function(user) {
            user.client.send(protocol.encode(data));
        });
    });

    // STATUS
    function sendStatus(client) {
        client.send(protocol.encode(status()));
    }
    function status() {
        return {
            spectators: userMgr.spectators().length,
            players: userMgr.players().length,
            game: engine.status(),
        };
    }
    
    // For test purposes only
    setInterval(function() {
        userMgr.spectators().forEach(function(user) {
            user.client.send(protocol.encode(user.uid));
        });
    }, 3000);
};

/**
 * User manager.
 * 
 * @author tkisiel
 */
exports.UserManager = function() {
    var self = this;
    var users = {
        players: {},
        spectators: {},
    };
    self.addPlayer = function(data) {
        var uid = data.uid;
        var user = users.players[uid];
        if (user) throw new Error("User " + uid + " already exists");
        users.players[uid] = data;
    };
    self.players = function() {
        return u_.values(users.players);
    };
    self.get = function(uid) {
        return users.players[uid];
    };
    self.addSpectator = function(data) {
        var key = util.format("%s@%s:%s", data.uid, data.host, data.port);
        users.spectators[key] = data;
    };
    self.spectators = function() {
        return u_.values(users.spectators);
    };
};

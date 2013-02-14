var dgram = require("dgram"),
    events = require("events"),
    u_ = require("underscore"),
    util = require("util");

console.logf = function() { console.log(util.format.apply(util, arguments)); };

var START_TEXT = "Game server listening on %s:%s",
    IN_MESSAGE_TEXT = "<%s:%s><%s>",
    OUT_MESSAGE_TEXT = "<%s><%s:%s>";

/**
 * UDP connector.
 * @param conf { protocol, host }
 * @author tkisiel
 */
exports.UdpConnector = function(conf) {
    this.conf = conf;
    this.sockets = {
        listeners: {},
        senders: {},
    };
};

/**
 * Binds a new socket to a given port. Listens to it and notifies caller about start and message events.
 * @param port
 * @param callbacks (optional) { onStart, onMessage(messageBuffer, info) }
 */
exports.UdpConnector.prototype.listen = function(port, callbacks) {
    var self = this;
    var socket = self.sockets.listeners[port];
    if (!socket) {
        socket = dgram.createSocket(self.conf.protocol.udp);
        self.sockets.listeners[port] = socket;
        socket.on("listening", function() {
            var address = socket.address();
            console.logf(START_TEXT, address.address, address.port);
            callbacks && callbacks.onStart && callbacks.onStart.call();
        });
        socket.bind(port, self.conf.host);
    }
    socket.on("message", function(msg, rinfo) {
        console.logf(IN_MESSAGE_TEXT, rinfo.address, rinfo.port, msg);
        callbacks && callbacks.onMessage && callbacks.onMessage(msg, rinfo);
    });
};

/**
 * Connects a socket to a given port on given host. Returns a client able to send messages over this connection.
 * @param host
 * @param port
 * @returns client { send(messageString) }
 */
exports.UdpConnector.prototype.connect = function(host, port) {
    var self = this;
    var key = ":" + host + ":" + port;
    var socket = self.sockets.senders[key];
    if (!socket) {
        socket = dgram.createSocket(self.conf.protocol.udp);
        self.sockets.senders[key] = socket;
    }
    return {
        send: function(msg) {
            var message = new Buffer(msg);
            socket.send(message, 0, message.length, port, host, function(err, bytes) {
                console.logf(OUT_MESSAGE_TEXT, msg, host, port);
                if (err) console.logf("ERROR: %s", err);
            });
        },
    };
};

/**
 * Shuts down all managed sockets.
 */
exports.UdpConnector.prototype.shutDown = function() {
    var listeners = u_.values(this.sockets.listeners);
    var senders = u_.values(this.sockets.senders);
    u_.union(listeners, senders).forEach(function(socket) {
        socket.close();
    });
};

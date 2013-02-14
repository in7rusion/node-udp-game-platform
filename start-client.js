/**
 * Simplest game client code.
 * 
 * @author tkisiel
 */
var properties = require("./game-server.properties").Properties,
    protocols = require("./lib/protocols").protocols,
    udpc = require("./lib/udp-connector"),
    u_ = require("underscore"),
    util = require("util");

var port = 48237;
var protocol = protocols[properties.protocol.game];
var connector = new udpc.UdpConnector(properties);
connector.listen(port, { onMessage: onMessage });

var client = connector.connect(properties.host, properties.port);
var msg = protocol.encode({ action: "watch", uid: "szatan", port: port });
client.send(msg);

function onMessage(msg) {
    var data = protocol.decode(msg);
    console.log("OK:", data);
}

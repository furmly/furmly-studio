const ProxyServer = require("./proxy");
const cf = process.argv[3];
const proxyServer = new ProxyServer(JSON.parse(cf), process);
proxyServer.start();
module.exports = {};

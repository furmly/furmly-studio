const ProxyServer = require("./proxy");
const cf = process.argv[2];
const proxyServer = new ProxyServer(JSON.parse(cf), process);
proxyServer.start();

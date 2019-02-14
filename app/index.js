const { ipcMain } = require("electron");
const url = require("url");
const { spawn } = require("child_process");
const debug = require("debug");
const Dispatcher = require("../dispatcher");
const proxyContants = require("../proxy-server/constants");
const ipcContants = require("../src/ipcConstants");

class App {
  constructor() {
    this.proxyServer = null;
    this.currentConnection = null;
  }

  init() {
    ipcMain.on(ipcContants.START_PROXY, (event, { connection, sslConfig }) => {
      if (!connection) {
        return event.sender.send(ipcContants.START_PROXY, {
          started: false,
          er: "Server cannot be empty"
        });
      }
      if (
        this.proxyServer &&
        this.currentConnection == connection &&
        connection
      )
        return event.sender.send(ipcContants.START_PROXY, { started: true });

      try {
        //if the proxy server has not been initialized create a new one.
        if (!this.proxyServer) {
          this.proxyServer = spawn(
            "node",
            [
              "./proxy-server/index.js",
              JSON.stringify({ connection: url.parse(connection), sslConfig })
            ],
            {
              stdio: ["ipc"],
              env: {
                DEBUG: "*"
              }
            }
          );

          this.currentConnection = connection;
          this.dispatcher = new Dispatcher(this.proxyServer);
          this.dispatcher.waitForEvent(proxyContants.STARTED, ({ er }) => {
            event.sender.send(ipcContants.START_PROXY, { started: !er, er });
          });
          this.proxyServer.on("exit", code => {
            this.proxyServer = null;
            this.currentConnection = null;
            event.sender.send(ipcContants.START_PROXY, { started: false });
          });
          this.proxyServer.on("error", er => {
            debug(er);
          });
          this.proxyServer.stdout.on("data", data => {
            debug(data.toString());
          });
          this.proxyServer.stderr.on("data", data => debug(data.toString()));
        } else {
          //send information to the proxy that the configuration has changed.
          this.dispatcher.send(
            proxyContants.CHANGE_CONFIG,
            { connection: url.parse(connection), sslConfig },
            ({ er }) => {
              if (!er) this.currentConnection = connection;
              event.sender.send(ipcContants.START_PROXY, { started: !er });
            }
          );
        }
      } catch (e) {
        debug(e);
        return event.sender.send(ipcContants.START_PROXY, { started: false });
      }
    });

    ipcMain.on(ipcContants.STOP_PROXY, () => {
      if (this.proxyServer) {
        this.proxyServer.removeAllListeners();
        this.proxyServer.kill(0);
        this.proxyServer = null;
      }
    });

    ipcMain.on(ipcContants.PROXY_STATUS, event => {
      if (!this.proxyServer)
        return event.sender.send(ipcContants.PROXY_STATUS, false);

      this.dispatcher.waitForEvent(proxyContants.STATUS, ({ status }) => {
        return event.sender.send(ipcContants.PROXY_STATUS, status);
      });
      this.proxyServer.send({ type: proxyContants.STATUS });
    });
  }
}

module.exports = App;

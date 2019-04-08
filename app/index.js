const { ipcMain } = require("electron");
const url = require("url");
const { spawn } = require("child_process");
const debug = require("debug")("furmly");
const Dispatcher = require("./dispatcher");
const proxyContants = require("../proxy/constants");
const ipcContants = require("./ipc-constants");

class App {
  constructor() {
    this.proxyServer = null;
    this.currentConnection = null;
  }

  init() {
    ipcMain.on(
      ipcContants.START_PROXY,
      (event, { connection, type, ...rest }) => {
        debug("recieved message on ipcmain process..");
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
            debug("about to start furmly proxy server");
            this.proxyServer = spawn(
              process.execPath,
              [
                "./proxy",
                "--start-proxy",
                JSON.stringify({ connection: url.parse(connection), ...rest })
              ],
              {
                stdio: ["pipe", "pipe", "pipe", "ipc"],
                env: {
                  DEBUG: process.env.DEBUG
                }
              }
            );

            const onExit = code => {
              debug("proxy server died on init.");
              debug("exit code:" + code);
              this.proxyServer.removeAllListeners();
              this.proxyServer = null;
              this.currentConnection = null;
              //this.dispatcher = null;
            };
            this.currentConnection = connection;
            this.dispatcher = new Dispatcher(this.proxyServer);
            this.dispatcher.waitForEvent(proxyContants.STARTED, ({ er }) => {
              if (!er) {
                this.proxyServer.removeListener("exit", onExit);
              }
              event.sender.send(ipcContants.START_PROXY, { started: !er, er });
            });
            this.proxyServer.once("exit", onExit);
            this.proxyServer.on("error", er => {
              debug(er);
            });
            this.proxyServer.stdout.on("data", data => {
              debug(data.toString());
            });
            this.proxyServer.stderr.on("data", data => debug(data.toString()));
          } else {
            debug(
              "proxy server is alive and functioning, so sending change config..."
            );
            //send information to the proxy that the configuration has changed.
            this.dispatcher.send(
              proxyContants.CHANGE_CONFIG,
              { connection: url.parse(connection), ...rest },
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
      }
    );

    ipcMain.on(ipcContants.STOP_PROXY, event => {
      debug("stop proxy called...");
      if (this.proxyServer) {
        debug("proxyserver is running...");
        this.proxyServer.kill();
        this.proxyServer.removeAllListeners();
        this.proxyServer = null;
        debug("server is dead");
        event.sender.send(ipcContants.STOP_PROXY, true);
        return;
      }
      debug("proxy already stopped");
      event.sender.send(ipcContants.STOP_PROXY, true);
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

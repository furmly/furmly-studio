const httpProxy = require("http-proxy");
const debug = require("debug")("proxy");
const https = require("https");
const http = require("http");
const jwtDecoder = require("jwt-decode");
const config = require("../config");
const Dispatcher = require("../dispatcher");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser").json();
const cookieParser = require("cookie-parser")();
const url = require("url");
const { generateUniqueID, cors, sendError } = require("./utils");
const constants = require("./constants");
let store = {};
const STOPPED = "STOPPED";
const STARTED = "STARTED";
const STARTING = "STARTING";

class ProxyServer {
  constructor(cfg = {}, context = process) {
    this.onRequest = this.onRequest.bind(this);
    this.setConfig(cfg);
    this.context = context;
  }

  login(req, res) {
    bodyParser(req, res, () => {
      store = {};
      res.setHeader("Set-Cookie", "_id=invalid;HttpOnly;Path=/");
      this._getToken.call(
        this,
        {
          username: req.body.username,
          password: req.body.password,
          grant_type: "password",
          scope: "furmly"
        },
        req,
        res
      );
    });
  }
  setConfig(cfg = {}) {
    debug(`new proxy config:${JSON.stringify(cfg, null, " ")}`);
    this.serverConfig = {
      connection: {
        host: (cfg.connection && cfg.connection.hostname) || config.furmly.host,
        protocol:
          (cfg.connection && cfg.connection.protocol) || config.furmly.protocol,
        port: (cfg.connection && cfg.connection.port) || config.furmly.port
      },
      token: {
        scope: cfg.serverDomain || config.furmly.domain,
        client_id: cfg.serverClientId || config.furmly.client.clientId,
        client_secret: cfg.serverSecret || config.furmly.client.clientSecret
      },
      auth_path: cfg.auth_path || config.furmly.auth_path
    };
    this.serverConfig.server_url = url.format(this.serverConfig.connection);
    this.proxyPort = cfg.proxyPort || config.app.port;
    let sslFolder;
    if (typeof cfg.sslFolder !== "undefined") {
      sslFolder = cfg.sslFolder;
    }
    if (!sslFolder) sslFolder = config.app.sslFolder;
    this.sslConfig = {
      clientCert: `${sslFolder}/${cfg.clientCertName ||
        config.app.certificatePath}`,
      clientKey: `${sslFolder}/${cfg.clientPrivateKeyName ||
        config.app.certificateKeyPath}`,
      caCert: `${sslFolder}/${cfg.caCertName || config.app.caCertificatePath}`
    };
  }
  refreshToken(req, res) {
    cookieParser(req, res, () => {
      if (req.cookies && store[req.cookies._id])
        this._getToken.call(
          this,
          {
            refresh_token: store[req.cookies._id].refresh_token,
            grant_type: "refresh_token"
          },
          req,
          res
        );
      else sendError(res, new Error("Invalid Credentials"));
    });
  }

  _getToken(opts, req, res) {
    const { connection, token } = this.serverConfig;
    const rData = Object.assign(opts, token);
    const requestData = JSON.stringify(rData);
    const options = Object.assign({}, connection, {
      path: this.serverConfig.auth_path,
      rejectUnauthorized: false,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData)
      }
    });
    debug(options);
    debug(requestData);
    const callback = function(response) {
      let str = "";
      response.on("data", function(chunk) {
        str += chunk;
      });

      response.on("end", function() {
        debug("response from login request:" + str);
        let data = "",
          responseMessage;
        try {
          data = JSON.parse(str);
        } catch (e) {
          debug(e);
        }
        if (data && data.access_token) {
          let id = generateUniqueID(req);
          store[id] = data;
          res.setHeader("Set-Cookie", "_id=" + id + ";HttpOnly;Path=/");

          responseMessage = {
            message: "successful"
          };
          res.writeHead(200, {
            "Content-Type": "application/json"
          });
          const claims = jwtDecoder(data.access_token);
          debug(claims);
          responseMessage.claims = claims;
        } else {
          res.writeHead(500, {
            "Content-Type": "application/json"
          });
          responseMessage = data;
          if (!responseMessage) {
            responseMessage = {
              message: "Unknown Error occurred during login."
            };
          }
        }
        res.write(JSON.stringify(responseMessage));
        res.end();
      });
    };

    const protocol = options.protocol == "http:" ? http : https;
    const request = protocol.request(options, callback);

    request.on("error", function(e) {
      debug("an error occurred while getting access token");
      debug(JSON.stringify(e, null, " "));
      sendError(res, e);
    });
    request.write(requestData);
    request.end();
  }

  stop(callback) {
    debug("stopping proxy server");
    if (!this.started) return callback();

    this.server.close(er => {
      if (er) return callback(er);
      this.started = false;
      this.status = STOPPED;
      debug("server stopped");
      return callback();
    });
  }

  onRequest(req, res) {
    debug(
      `\n-------------------- new request:${req.url} -----------------------\n`
    );
    debug(req.url);
    if (cors(req, res)) return;
    if (/\/auth\/login$/g.test(req.url)) {
      return this.login(req, res);
    }
    if (/\/auth\/refresh$/g.test(req.url)) return this.refreshToken(req, res);

    cookieParser(req, res, () => {
      const callback = () => {
        return this.proxy.web(req, res, err => {
          if (err) {
            debug("proxy error:" + err + ` ${req.url}`);
            res.writeHead(500, {
              "Content-Type": "application/json"
            });
            res.end(
              JSON.stringify({
                message: "An error occurred while proxying request"
              })
            );
          }
        });
      };
      debug("proxying request");
      if (req.cookies && store[req.cookies._id]) {
        req.headers.Authorization = `Bearer ${
          store[req.cookies._id].access_token
        }`;
        debug(`set authorization header for req ${req.url}`);
        callback();
        return;
      }

      return callback();
    });
  }
  setupDispatcher() {
    this.dispatcher = new Dispatcher(this.context);
    this.dispatcher.waitForEvent(
      constants.STATUS,
      (...respond) => {
        return respond[respond.length - 1]({
          started: this.started
        });
      },
      true
    );

    this.dispatcher.waitForEvent(
      constants.CHANGE_CONFIG,
      (...respond) => {
        debug("config change:");
        debug(arguments);
        const resp = respond[respond.length - 1];
        try {
          this.setConfig(respond[0]);
          resp();
        } catch (er) {
          return resp({ er });
        }
      },
      true
    );
  }
  start() {
    try {
      this.status = STARTING;
      this.setupDispatcher();
      this.proxy = httpProxy.createProxy({
        target: Object.assign({}, this.serverConfig.connection, {
          key: fs.readFileSync(this.sslConfig.clientKey),
          cert: fs.readFileSync(this.sslConfig.clientCert),
          ca: fs.readFileSync(this.sslConfig.caCert),
          https: true
        }),
        secure: this.context.env.NODE_ENV === "production",
        changeOrigin: true
      });
      this.server = https.createServer(
        {
          key: fs.readFileSync(
            path.join(__dirname, "../ssl/proxy-server-key.pem")
          ),
          cert: fs.readFileSync(
            path.join(__dirname, "../ssl/proxy-server-crt.pem")
          )
        },
        this.onRequest
      );

      this.server.on("error", er => {
        debug("something catastrophic may have occurred in proxy server \n\n");
        debug(er);
        this.context.send({ type: constants.ERROR, er });
      });

      this.server.listen(this.proxyPort, er => {
        if (er) return this.context.send({ type: constants.STARTED, er });
        debug(
          `\n\n----------------- http proxy started on ${
            this.proxyPort
          }----------------`
        );
        this.started = true;
        this.status = STARTED;
        this.context.send({ type: constants.STARTED });
      });
    } catch (er) {
      this.context.send({ type: constants.STARTED, er });
    }
  }
}

module.exports = ProxyServer;

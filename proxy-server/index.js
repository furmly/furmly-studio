const httpProxy = require("http-proxy");
const debug = require("debug")("proxy");
const https = require("https");
const jwtDecoder = require("jwt-decode");
const config = require("../config");
const fs = require("fs");
const bodyParser = require("body-parser").json();
const cookieParser = require("cookie-parser")();
const url = require("url");
const { generateUniqueID, cors, sendError } = require("./utils");
let store = {};
const STOPPED = "STOPPED";
const STARTED = "STARTED";
const STARTING = "STARTING";

class ProxyServer {
  constructor(cfg = {}) {
    this.onRequest = this.onRequest.bind(this);
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
          scope: "dynamo"
        },
        req,
        res
      );
    });
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

    const request = https.request(options, callback);

    request.on("error", function(e) {
      debug("an error occurred while getting access token");
      debug(JSON.stringify(e, null, " "));
      sendError(res, e);
    });
    request.write(requestData);
    request.end();
  }

  stop() {
    debug("stopping proxy server");
    if (this.started) {
      this.server.close();
    }
    this.started = true;
    this.status = STOPPED;
    debug("server stopped");
  }

  onRequest(req, res) {
    debug("\n\n-------------------- req -----------------------");
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

  start() {
    this.status = STARTING;
    this.proxy = httpProxy.createProxy({
      target: Object.assign({}, this.serverConfig.connection, {
        key: fs.readFileSync(this.sslConfig.clientKey),
        cert: fs.readFileSync(this.sslConfig.clientCert),
        ca: fs.readFileSync(this.sslConfig.caCert),
        https: true
      }),
      secure: process.env.NODE_ENV === "production",
      changeOrigin: true
    });
    this.server = https.createServer(
      {
        key: fs.readFileSync("./ssl/proxy-server-key.pem"),
        cert: fs.readFileSync("./ssl/proxy-server-crt.pem")
      },
      this.onRequest
    );

    this.server.on("error", () => {
      debug("something catastrophic may have occurred \n\n");
      debug(arguments);
    });

    this.server.listen(this.proxyPort, () => {
      debug(
        `\n\n----------------- http proxy started on ${
          this.proxyPort
        }----------------`
      );
      this.started = true;
      this.status = STARTED;
      if (this.requestStop) this.server.close();
    });
  }
}

module.exports = ProxyServer;

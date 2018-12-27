const crypto = require("crypto");
const config = require("../config");
const debug = require("debug")("cors");
function generateUniqueID(req) {
  const secret = config.app.cookie_gen_password;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.headers) + new Date().getTime())
    .digest("hex");
  return hash;
}

function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    debug("cors request!");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

function sendError(res, e) {
  res.writeHead(500, {
    "Content-Type": "application/json"
  });
  res.write(
    JSON.stringify({
      message: (e && e.code) || (e && e.message)
    })
  );
  res.end();
}

module.exports = {
  sendError,
  cors,
  generateUniqueID
};

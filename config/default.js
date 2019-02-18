const env = require("./fromEnv");
const path = require("path");
console.log(path.dirname(require.main.filename));
module.exports = {
  app: {
    port: env("FURMLY_STUDIO_PORT", 3330),
    sslFolder: env(
      "FURMLY_SSL_FOLDER",
      path.dirname(require.main.filename) + "\\ssl"
    ),
    certificatePath: env("FURMLY_STUDIO_CERTIFICATE_PATH", "superc-crt.pem"),
    certificateKeyPath: env(
      "FURMLY_STUDIO_CERTIFICATE_KEY_PATH",
      "superc-key.pem"
    ),
    caCertificatePath: env("FURMLY_STUDIO_CA_CERTIFICATE_PATH", "ca-crt.pem"),
    cookie_gen_password: env(
      "FURMLY_STUDIO_COOKIE_GEN_SECRET",
      "alcoholinmyblood"
    )
  },
  furmly: {
    scheme: "https",
    host: "localhost",
    port: 443,
    auth_path: "/auth/token",
    domain: "",
    client: {
      clientId: env(
        "FURMLY_STUDIO_CLIENT_ID",
        "nWIN5ZtLdjvDi2dAkT23juKIKaSYE242"
      ),
      clientSecret: env(
        "FURMLY_STUDIO_CLIENT_SECRET",
        "5EIHmKH1WRlM6eY5cdNX1bWFeOnKhLLw"
      )
    }
  }
};

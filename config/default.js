const env = require("./fromEnv");
module.exports = {
  app: {
    port: env("FURMLY_STUDIO_PORT", 3330),
    sslFolder: env("FURMLY_SSL_FOLDER", "./ssl"),
    certificatePath: env("FURMLY_STUDIO_CERTIFICATE_PATH", "superc-crt.pem"),
    certificateKeyPath: env("FURMLY_STUDIO_CERTIFICATE_KEY_PATH", "superc-key.pem"),
    caCertificatePath: env("FURMLY_STUDIO_CA_CERTIFICATE_PATH", "ca-crt.pem"),
    cookie_gen_password: env("FURMLY_STUDIO_COOKIE_GEN_SECRET", "alcoholinmyblood")
  },
  furmly: {
    scheme: "https",
    host: "localhost",
    port: 443,
    auth_path: "/auth/token",
    domain: "",
    client: {
      clientId: env("FURMLY_STUDIO_CLIENT_ID", "n2wZASNunUShF2xQ0o4P44xImeSX6hlm"),
      clientSecret: env("FURMLY_STUDIO_CLIENT_SECRET", "kLqqED9oQnlnRxSjJTQZmRwH4ZKekNNW")
    }
  }
};

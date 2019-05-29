const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { spawn } = require("child_process");
const CopyPlugin = require("copy-webpack-plugin");
const config = require("./config");

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, "src");
const configDir = path.resolve(__dirname, "config");
const furmly = path.resolve(__dirname, "./node_modules/furmly-base-web/dist");
const furmlyClient = path.resolve(
  __dirname,
  "./node_modules/furmly-client/dist"
);
const furmlyClient2 = path.resolve(
  __dirname,
  "./node_modules/furmly-base-web/node_modules/furmly-client/dist"
);
const furmlyFonts = furmly + "\\*.ttf";
const worker = furmly + "/worker.js";
const dist = path.resolve(__dirname, "dist");
const startArgs = JSON.parse(process.env.args || "[]");
module.exports = {
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          { loader: "sass-loader" }
        ],
        include: [
          defaultInclude,
          path.resolve(__dirname, "./node_modules/storm-react-diagrams")
        ]
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [
                [
                  "module-resolver",
                  {
                    cwd: "babelrc",
                    alias: {
                      error_handler: "./src/errorhandler.js",
                      client_config: "./furmly-client.config.js"
                    }
                  }
                ]
              ]
            }
          }
        ],
        include: [
          defaultInclude,
          configDir,
          furmlyClient,
          furmlyClient2,
          furmly
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]" }],
        include: defaultInclude
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          { loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]" }
        ],
        include: [defaultInclude, furmly]
      }
    ]
  },
  target: "electron-renderer",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Furmly Studio",
      appMountId: "root",
      template: "./src/assets/index.html",
      inject: false
    }),
    new webpack.DefinePlugin({
      "process.env.FURMLY_STUDIO_PORT": JSON.stringify(config.get("app.port")),
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.NODE_CONFIG_DIR": JSON.stringify(
        __dirname + "/src/jadeconfig"
      )
    }),
    new CopyPlugin([
      { from: furmlyFonts, to: dist, flatten: true },
      {
        from: furmly + "\\webfonts\\*",
        to: dist + "\\webfonts",
        flatten: true
      },
      { from: worker, to: dist, flatten: true }
    ])
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "src/assets/"),
      components: path.resolve(__dirname, "src/components/"),
      "furmly-controls": path.resolve(__dirname, "src/furmly")
    }
  },
  devtool: "source-map",
  devServer: {
    contentBase: [path.resolve(__dirname, "dist")],
    port: 9990,
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    before() {
      spawn("electron", [".", ...startArgs], {
        shell: true,
        env: process.env,
        stdio: "inherit"
      })
        .on("close", code => process.exit(0))
        .on("error", spawnError => console.error(spawnError));
    }
  }
};

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { spawn } = require("child_process");
const CopyPlugin = require("copy-webpack-plugin");

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, "src");
const configDir = path.resolve(__dirname, "config");
const furmly = path.resolve(__dirname, "./node_modules/furmly-base-web/dist");
const furmlyClient = path.resolve(
  __dirname,
  "./node_modules/furmly-client/dist"
);
const furmlyFonts = furmly + "\\**.ttf";
console.log(furmlyFonts);
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
        include: defaultInclude
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
                      client_config: "./furmly-client.config.js",
                      call_api: "./.storybook/dynamo_client_config/call_api.js"
                    }
                  }
                ]
              ]
            }
          }
        ],
        include: [defaultInclude, configDir, furmlyClient, furmly]
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
    new HtmlWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.NODE_CONFIG_DIR": JSON.stringify(
        __dirname + "/src/jadeconfig"
      )
    }),
    new CopyPlugin([
      { from: furmlyFonts, to: path.resolve(__dirname, "dist") }
    ])
  ],
  devtool: "cheap-source-map",
  devServer: {
    contentBase: [path.resolve(__dirname, "dist"), furmly],
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    before() {
      spawn("electron", ["."], {
        shell: true,
        env: process.env,
        stdio: "inherit"
      })
        .on("close", code => process.exit(0))
        .on("error", spawnError => console.error(spawnError));
    }
  }
};

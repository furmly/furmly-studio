const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
  "./node_modules/furmly-bnpmase-web/node_modules/furmly-client/dist"
);
const furmlyFonts = furmly + "\\*.ttf";
const worker = furmly + "/worker.js";
const dist = path.resolve(__dirname, "dist");

module.exports = {
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
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
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "src/assets/"),
      components: path.resolve(__dirname, "src/components/"),
      "furmly-controls": path.resolve(__dirname, "src/furmly")
    }
  },
  target: "electron-renderer",
  plugins: [
    new HtmlWebpackPlugin({ title: "Furmly Studio" }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "bundle.css",
      chunkFilename: "[id].css"
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.FURMLY_STUDIO_PORT": JSON.stringify(config.get("app.port"))
    }),
    new CopyPlugin([
      { from: furmlyFonts, to: dist },
      { from: worker, to: dist }
    ])
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  }
};

const path = require("path");
const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");

module.exports = merge(commonConfiguration, {
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "../dist"),
    },
    open: true,
    //host: "192.168.1.3",
    host: "0.0.0.0",
  },
});

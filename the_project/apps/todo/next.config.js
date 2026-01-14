const path = require("path");

module.exports = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

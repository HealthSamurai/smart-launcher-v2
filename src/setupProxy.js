const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const paths = [
    "/v",
    "/smart-style.json",
    "/launcher",
    "/remote-launch",
    "/keys",
    "/public_key",
    "/env.js",
  ];

  for (const path of paths) {
    app.use(
      path,
      createProxyMiddleware({ target: `http://127.0.0.1:8445${path}` }),
    );
  }
};

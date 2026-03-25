const CracoLessPlugin = require("craco-less");
const path = require("path");

// 本地开发时可通过环境变量将 API 代理到远端，无需启动本地 Go 后端或 Docker
// 示例：REACT_APP_BACKEND_URL=https://auth.itestu.cn yarn start
const BACKEND_TARGET = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const makeProxy = (target) => ({ target, changeOrigin: true, secure: target.startsWith("https") });

module.exports = {
  devServer: {
    proxy: {
      "/api": makeProxy(BACKEND_TARGET),
      "/swagger": makeProxy(BACKEND_TARGET),
      "/files": makeProxy(BACKEND_TARGET),
      "/.well-known/openid-configuration": makeProxy(BACKEND_TARGET),
      "/cas/**/serviceValidate": makeProxy(BACKEND_TARGET),
      "/cas/**/proxyValidate": makeProxy(BACKEND_TARGET),
      "/cas/**/proxy": makeProxy(BACKEND_TARGET),
      "/cas/**/validate": makeProxy(BACKEND_TARGET),
      "/cas/**/p3/serviceValidate": makeProxy(BACKEND_TARGET),
      "/cas/**/p3/proxyValidate": makeProxy(BACKEND_TARGET),
      "/scim": makeProxy(BACKEND_TARGET),
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {"@primary-color": "rgb(89,54,213)", "@border-radius-base": "5px"},
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = path.resolve(__dirname, "build-temp");
      webpackConfig.output.path = path.resolve(__dirname, "build-temp");

      // ignore webpack warnings by source-map-loader
      // https://github.com/facebook/create-react-app/pull/11752#issuecomment-1345231546
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ];

      // use polyfill Buffer with Webpack 5
      // https://viglucci.io/articles/how-to-polyfill-buffer-with-webpack-5
      // https://craco.js.org/docs/configuration/webpack/
      webpackConfig.resolve.fallback = {
        buffer: require.resolve("buffer/"),
        process: false,
        util: false,
        url: false,
        zlib: false,
        stream: false,
        http: false,
        https: false,
        assert: false,
        crypto: false,
        os: false,
        fs: false,
      };

      return webpackConfig;
    },
  },
};

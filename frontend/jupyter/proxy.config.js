//AAW: JS file to replace src/proxy.conf.json
const PROXY_CONFIG = {
  '/api/*': {
    target: 'http://localhost:5000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req) {
      const uidHeader = process.env.KF_USER_ID;
      if (uidHeader) {
        req.headers['kubeflow-userid'] = uidHeader;
      }
    },
  },
  "/static": {
    target: "http://localhost:4200",
    pathRewrite: { "^/static": "" },
    secure: false
  }
};

module.exports = PROXY_CONFIG;

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
};

module.exports = PROXY_CONFIG;

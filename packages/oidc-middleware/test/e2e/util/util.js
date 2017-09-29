const constants = require('./constants');
const url = require('url');

const util = module.exports;

const DemoServer = require('../harness/server');

const environmentConfig = {
  issuer: constants.ISSUER,
  client_id: constants.CLIENT_ID,
  client_secret: constants.CLIENT_SECRET,
  redirect_uri: constants.REDIRECT_URI
};

util.createDemoServer = (options) => {
  return new DemoServer(Object.assign({}, environmentConfig, options || {}));
};

util.createDemoServerWithCustomLoginPage = (options) => {
  const baseConfig = Object.assign({}, environmentConfig, options || {});
  return new DemoServer(Object.assign(baseConfig, {
    routes: {
      login: {
        viewHandler: (req, res, next) => {
          const baseUrl = url.parse(baseConfig.issuer).protocol + '//' + url.parse(baseConfig.issuer).host;
          res.render('login', {
            csrfToken: req.csrfToken(),
            baseUrl: baseUrl
          });
        }
      }
    }
  }));
};


util.ensureTrailingSlash = str => {
  if (str.slice(-1) === '/') {
    return str;
  }
  return `${str}/`;
};

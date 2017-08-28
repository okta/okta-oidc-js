const qs = require('qs');
const request = require('request');
const url = require('url');

function getAccessToken(options = {}) {
  const {
    ISSUER,
    CLIENT_ID,
    REDIRECT_URI,
    USERNAME,
    PASSWORD
  } = options;

  return new Promise((resolve, reject) => {
    const urlProperties = url.parse(ISSUER);
    const domain = urlProperties.protocol + '//' + urlProperties.host;
    const postUrl = domain + '/api/v1/authn';
    request.post(postUrl, {
      json: true,
      body: {
        username: USERNAME,
        password: PASSWORD
      }
    }, function (err, resp, body) {
      if (err || resp.statusCode >= 400) {
        return resolve(err || body);
      }
      const authorizeParams = {
        sessionToken: body.sessionToken,
        response_type: 'token',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid',
        nonce: 'foo',
        state: 'foo'
      }
      const authorizeUrl = ISSUER + '/v1/authorize?' + qs.stringify(authorizeParams);
      request.get(authorizeUrl, {followRedirect: false}, function(err, resp, body) {
        const parsedUrl = url.parse(resp.headers.location, true);
        if (parsedUrl.query.error) {
          return reject(parsedUrl.query.error);
        }
        const match = resp.headers.location.match(/access_token=([^&]+)/);
        const accessToken = match && match[1];
        if (!accessToken){
          return reject('Could not parse access token from URO');
        }
        resolve(accessToken);
      })
    });
  });
}

module.exports = {
  getAccessToken: getAccessToken
}
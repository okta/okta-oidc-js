const { ExpressOIDC } = require('../oidc-middleware');
const express = require('express');
const request = require('supertest');
const session = require('express-session');
const uuid = require('uuid');

describe('/login', () => {

  const app = express();

  before((done) => {
    app.use(session({
      secret: uuid.v4(),
      resave: true,
      saveUninitialized: false
    }));

    const oidc = new ExpressOIDC({
      issuer: 'https://len-dev.trexcloud.com/oauth2/default',
      client_id: '0oa1zb6cgcyIQhWYS0g7',
      client_secret: '4t5tfftm5O5OFMENk1ZagbiusLpUpQhnuoiZ1v0Q',
      redirect_uri: 'http://localhost:3000/authorization-code/callback'
    });

    app.use(oidc.router);
    app.listen(3000, done);
  });

  it('should send me to the authorize endpoint FOO', () => {
    return request(app)
      .get('/login')
      .expect(302)
      .then(function(res) {
        console.log(res.headers.location);
        // assert that the Location (authorizeUrl) has the correct auth request params
      });
  });
});
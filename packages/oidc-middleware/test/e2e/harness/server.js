const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const constants = require('../util/constants');
const { ExpressOIDC } = require('../../../index.js');

const app = express();

app.use(session({
  secret: uuid(), // this will invalidate all sessions on each restart
  resave: true,
  saveUninitialized: false
}));

const oidc = new ExpressOIDC({
  issuer: constants.ISSUER,
  client_id: constants.CLIENT_ID,
  client_secret: constants.CLIENT_SECRET,
  redirect_uri: constants.REDIRECT_URI
});

app.use(oidc.router);

app.get('/', (req, res) => {
  if (req.userinfo) {
    res.send(`Hello ${req.userinfo.sub}! Welcome home`);
  } else {
    res.send('Hello World!');
  }
});

app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send(JSON.stringify(req.userinfo));
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

oidc.on('ready', () => {
  app.listen(constants.PORT, () => console.log(`Test app listening on port ${constants.PORT}!`));
});

oidc.on('error', err => {
  console.log('Unable to start the server', err);
});

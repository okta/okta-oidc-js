const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const { ExpressOIDC } = require('./oidc-middleware');

const app = express();

app.use(session({
  secret: uuid(), // this will invalidate all sessions on each restart
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

app.get('/', (req, res) => {
  if (req.userinfo) {
    res.send(`Hello ${req.userinfo.sub}!`);
  } else {
    res.send('Hello World!');
  }
});

app.get('/protected', oidc.ensureLoggedIn(), (req, res) => {
  res.send(JSON.stringify(req.userinfo));
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

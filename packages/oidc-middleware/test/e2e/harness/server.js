const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const constants = require('../util/constants');
const { ExpressOIDC } = require('../../../index.js');
const path = require('path');

module.exports = class DemoServer {
  constructor(oidcOptions) {
    this.oidcOptions = oidcOptions;
  }
  start() {
    const app = express();
    this.app = app;
    app.use(session({
      secret: uuid(), // this will invalidate all sessions on each restart
      resave: true,
      saveUninitialized: false
    }));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    const oidc = new ExpressOIDC(this.oidcOptions);
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

    return new Promise((resolve, reject) => {
      oidc.on('error', err => {
        console.log('Unable to start the server', err);
        reject(err);
      });
      oidc.on('ready', () => {
        const enableDestroy = require('server-destroy');
        this.httpServer = require('http').createServer(app);
        this.httpServer.listen(constants.PORT, (err) => {
          if (err) {
            return reject(err);
          }
          console.log(`Test app listening on port ${constants.PORT}!`)
          return resolve();
        });
        enableDestroy(this.httpServer);
      });
    });
  }
  stop() {
    console.log('Sever shutting down');
    return new Promise((resolve, reject) => {
      this.httpServer.destroy((err) => {
        console.log('Server destroyed')
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}


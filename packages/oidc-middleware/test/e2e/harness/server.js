/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

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
      if (req.userContext) {
        res.send(`Hello ${req.userContext.userinfo.sub}! Welcome home`)
      } else {
        res.send('Hello World!');
      }
    });

    app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
      res.send(JSON.stringify(req.userContext));
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
    console.log('Server shutting down');
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


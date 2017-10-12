import { Component } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';

import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-sessionLogin',
  template: `
  <router-outlet></router-outlet>
  
  <div>
  <br/>
    <label>
      Username:
      <input #username id="username" type="text" />
      Password:
      <input #password id="password" type="password" />
    </label>
    <button id="submit" (click)="signIn(username.value, password.value)">Login</button>
  </div>
  `
})
export class SessionTokenLogin {
  oktaAuth: OktaAuth;

  constructor(private okta: OktaAuthService) {
    this.oktaAuth = new OktaAuth({
      url: this.okta.getOktaAuth().options.url
    });
  }

  signIn(username, password) {
    this.oktaAuth.signIn({
      username: username,
      password: password
    })
    .then(res => this.okta.loginRedirect({
        sessionToken: res.sessionToken
    }))
    .catch(err => console.log('Found an error', err));
  }
}

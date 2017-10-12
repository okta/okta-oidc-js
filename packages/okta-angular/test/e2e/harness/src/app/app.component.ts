import { Component } from '@angular/core';

import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  template: `
  <button id="home-button" routerLink="/"> Home </button>
  <button id="login-button" *ngIf="!oktaAuth.isAuthenticated()" routerLink="/login"> Login </button>
  <button id="logout-button" *ngIf="oktaAuth.isAuthenticated()" (click)="oktaAuth.logout()"> Logout </button>
  <button id="protected-button" routerLink="/protected"> Protected </button>
  <button id="protected-login-button" routerLink="/protected-with-data"> Protected Page w/ custom config </button>

  <router-outlet></router-outlet>
  `,
})
export class AppComponent {

  constructor(public oktaAuth: OktaAuthService) { }
}

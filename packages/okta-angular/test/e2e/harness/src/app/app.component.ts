import { Component } from '@angular/core';

import { OktaAuthService } from '../../../../../src/';

@Component({
  selector: 'app-root',
  template: `
  <button routerLink="/"> Home </button>
  <button *ngIf="!oktaAuth.isAuthenticated()" routerLink="/login"> Login </button>
  <button *ngIf="oktaAuth.isAuthenticated()" (click)="oktaAuth.logout()"> Logout </button>
  <button routerLink="/protected"> Protected </button>

  <pre *ngFor="let token of tokens">{{token | json}}\n</pre>
  <router-outlet></router-outlet>  
  `,
})
export class AppComponent {
  tokens;

  constructor(public oktaAuth: OktaAuthService) {this.tokens = oktaAuth.getTokens()}
}

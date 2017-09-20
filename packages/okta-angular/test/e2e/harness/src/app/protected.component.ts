import { Component } from '@angular/core';

@Component({
  selector: 'app-secure',
  template: `{{message}}`
})
export class ProtectedComponent {
  message;

  constructor() {
    this.message = 'Protected endpont!';
  }
}

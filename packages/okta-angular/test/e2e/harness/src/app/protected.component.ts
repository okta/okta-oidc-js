import { Component } from '@angular/core';

@Component({
  selector: 'app-secure',
  template: ``
})
export class ProtectedComponent {
  constructor() { console.log("Protected endpont!"); }
}

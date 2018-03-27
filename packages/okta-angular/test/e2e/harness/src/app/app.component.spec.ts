import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { environment } from './../environments/environment';

import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '@okta/okta-angular';

describe('Unit Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    const config = {
      issuer: environment.ISSUER,
      redirectUri: environment.REDIRECT_URI,
      clientId: environment.CLIENT_ID,
      scope: 'email',
      responseType: 'id_token'
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule.initAuth(config)
      ],
      declarations: [
        AppComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should instantiate the OktaAuth object', async(() => {
    const config = component.oktaAuth.getOktaConfig();
    expect(config.issuer).toBe(environment.ISSUER);
    expect(config.redirectUri).toBe(environment.REDIRECT_URI);
    expect(config.clientId).toBe(environment.CLIENT_ID);
    expect(config.scope).toBe('email openid');
    expect(config.responseType).toBe('id_token');
  }));
});

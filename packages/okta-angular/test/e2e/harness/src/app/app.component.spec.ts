import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { environment } from './../environments/environment';

import {
  OktaAuthModule,
  OktaAuthService,
} from '@okta/okta-angular';

const mockAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOj' +
                        'EsImp0aSI6IkFULnJ2Ym5TNGlXdTJhRE5jYTNid1RmMEg5Z' +
                        'VdjV2xsS1FlaU5ZX1ZlSW1NWkEiLCJpc3MiOiJodHRwczov' +
                        'L2xib3lldHRlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p' +
                        '5YzhtdlZUSk8wZzciLCJhdWQiOiJodHRwczovL2xib3lldH' +
                        'RlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p5YzhtdlZUS' +
                        'k8wZzciLCJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIs' +
                        'ImlhdCI6MTQ2ODQ2NzY0NywiZXhwIjoxNDY4NDcxMjQ3LCJ' +
                        'jaWQiOiJQZjBhaWZyaFladTF2MFAxYkZGeiIsInVpZCI6Ij' +
                        'AwdTFwY2xhNXFZSVJFRExXQ1FWIiwic2NwIjpbIm9wZW5pZ' +
                        'CIsImVtYWlsIl19.ziKfS8IjSdOdTHCZllTDnLFdE96U9bS' +
                        'IsJzI0MQ0zlnM2QiiA7nvS54k6Xy78ebnkJvmeMCctjXVKk' +
                        'JOEhR6vs11qVmIgbwZ4--MqUIRU3WoFEsr0muLl039QrUa1' +
                        'EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6cgA';
const standardAccessTokenParsed = {
  accessToken: mockAccessToken,
  expiresAt: new Date().getTime() + 100, // ensure token is active
  scopes: ['openid', 'email'],
  tokenType: 'Bearer',
  authorizeUrl: environment.ISSUER + '/oauth2/v1/authorize',
  userinfoUrl: environment.ISSUER + '/oauth2/v1/userinfo'
};

describe('Module configuration', () => {
  const createInstance = (params = {}) => {
    return () => new OktaAuthService(params, undefined);
  };
  it('should throw if no issuer is provided', () => {
    expect(createInstance()).toThrow();
  });
  it('should throw if an issuer that does not contain https is provided', () => {
    expect(createInstance({ issuer: 'http://foo.com' })).toThrow();
  });
  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    expect(createInstance({ issuer: 'https://{yourOktaDomain}' })).toThrow();
  });
  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    expect(createInstance({ issuer: 'https://foo-admin.okta.com' })).toThrow();
  });
  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    expect(createInstance({ issuer: 'https://foo-admin.oktapreview.com' })).toThrow();
  });
  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    expect(createInstance({ issuer: 'https://foo-admin.okta-emea.com' })).toThrow();
  });
  it('should throw if an issuer matching more than one ".com" is provided', () => {
    expect(createInstance({ issuer: 'https://foo.okta.com.com' })).toThrow();
  });
  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    expect(createInstance({ issuer: 'https://://foo.okta.com' })).toThrow();
  });
  it('should throw if an issuer matching more than one "://" is provided', () => {
    expect(createInstance({ issuer: 'https://foo.okta://.com' })).toThrow();
  });
  it('should throw if the client_id is not provided', () => {
    expect(createInstance({ issuer: 'https://foo' })).toThrow();
  });
  it('should throw if a client_id matching {clientId} is provided', () => {
    expect(
      createInstance({
        clientId: '{clientId}',
        issuer: 'https://foo'
      })
    ).toThrow();
  });
  it('should throw if a redirectUri matching {redirectUri} is provided', () => {
    expect(
      createInstance({
        clientId: 'foo',
        issuer: 'https://foo',
        redirectUri: '{redirectUri}'
      })
    ).toThrow();
  });
});

describe('Unit Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    const config = {
      issuer: environment.ISSUER,
      redirectUri: environment.REDIRECT_URI,
      clientId: environment.CLIENT_ID,
      scope: 'email',
      responseType: 'id_token',
      testing: {
        disableHttpsCheck: false
      }
    };

    if (environment.OKTA_TESTING_DISABLEHTTPSCHECK) {
      config.testing = {
        disableHttpsCheck: true
      };
    }

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule.initAuth(config)
      ],
      declarations: [
        AppComponent
      ]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.clear();
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

  it('can retrieve an accessToken from the tokenManager', async (done) => {
    // Store the token
    localStorage.setItem(
      'okta-token-storage',
      JSON.stringify({'accessToken': standardAccessTokenParsed}),
    );
    const accessToken = await component.oktaAuth.getAccessToken();
    expect(accessToken).toBe(mockAccessToken);
    done();
  });

  it('isAuthenticated() returns true when the TokenManager returns an access token', async (done) => {
    // Store the token
    localStorage.setItem(
      'okta-token-storage',
      JSON.stringify({'accessToken': standardAccessTokenParsed}),
    );
    const authenticated = await component.oktaAuth.isAuthenticated();
    expect(authenticated).toBeTruthy();
    done();
  });

  it('isAuthenticated() returns false when the TokenManager does not return an access token', async (done) => {
    // Don't store the token
    const authenticated = await component.oktaAuth.isAuthenticated();
    expect(authenticated).toBeFalsy();
    done();
  });
});


jest.mock('@okta/okta-auth-js');

import { Router } from '@angular/router';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import OktaAuth from '@okta/okta-auth-js';

import PACKAGE_JSON from '../../package.json';

import {
  OktaAuthModule,
  OktaAuthService,
  OKTA_CONFIG
} from '../../src/okta-angular';

const VALID_CONFIG = {
  clientId: 'foo',
  issuer: 'https://foo',
  redirectUri: 'https://foo'
};

describe('Angular service', () => {
  beforeEach(() => {
    OktaAuth.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('configuration', () => {
    const createInstance = (params = {}) => {
      const router: unknown = undefined;
      return () => new OktaAuthService(params, router as Router);
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

    it('will not throw if config is valid', () => {
      expect(
        createInstance(VALID_CONFIG)
      ).not.toThrow();
    });

    it('will add "openid" scope if not present', () => {
      const config = createInstance(VALID_CONFIG)().getOktaConfig();
      expect(config.scopes).toMatchInlineSnapshot(`
        Array [
          "openid",
        ]
      `);
    });
  });

  it('Can set the https secure cookie setting', () => {
    const router: unknown = undefined;
    const service = new OktaAuthService(Object.assign({}, VALID_CONFIG, { tokenManager: { secure: true }}), router as Router);
    const tmConfig = service.getOktaConfig().tokenManager;
    expect(tmConfig).toBeDefined();
    expect((tmConfig || {}).secure).toBe(true);
  });

  it('Adds a user agent on internal oktaAuth instance', () => {
    const router: unknown = undefined;
    const service = new OktaAuthService(VALID_CONFIG, router as Router);
    expect(service['oktaAuth'].userAgent.indexOf(`@okta/okta-angular/${PACKAGE_JSON.version}`)).toBeGreaterThan(-1);
  });

  it('Can create the service via angular injection', () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule.initAuth(VALID_CONFIG)
      ],
      providers: [OktaAuthService],
    });
    const service = TestBed.get(OktaAuthService);
    expect(service.config).toMatchInlineSnapshot(`
      Object {
        "clientId": "foo",
        "issuer": "https://foo",
        "redirectUri": "https://foo",
        "responseType": undefined,
        "scopes": Array [
          "openid",
        ],
        "tokenManager": undefined,
      }
    `);
  });

  describe('service methods', () => {
    function createService(config?: object) {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
          OktaAuthModule.initAuth(config || VALID_CONFIG)
        ],
        providers: [OktaAuthService],
      });
      return TestBed.get(OktaAuthService);
    }

    describe('isAuthenticated', () => {

      it('returns false if no access or id token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(undefined));
        const service = createService();
        const val = await service.isAuthenticated();
        expect(val).toBe(false);
      });


      it('returns true if access token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve('something'));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(undefined));
        const service = createService();
        const val = await service.isAuthenticated();
        expect(val).toBe(true);
      });

      it('returns true if id token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve('something'));
        const service = createService();
        const val = await service.isAuthenticated();
        expect(val).toBe(true);
      });
    });

    describe('getAccessToken', () => {
      it('retrieves token from token manager', async () => {
        const mockToken = {
          accessToken: 'foo'
        };
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('accessToken');
              return Promise.resolve(mockToken);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        const service = createService();
        const retVal = await service.getAccessToken();
        expect(retVal).toBe(mockToken.accessToken);
      });

      it('catches exceptions', async () => {
        const mockToken = {
          accessToken: 'foo'
        };
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('accessToken');
              throw new Error('expected test error');
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        const service = createService();
        const retVal = await service.getAccessToken();
        expect(retVal).toBe(undefined);
      });
    });

    describe('getIdToken', () => {
      it('retrieves token from token manager', async () => {
        const mockToken = {
          idToken: 'foo'
        };
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('idToken');
              return Promise.resolve(mockToken);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        const service = createService();
        const retVal = await service.getIdToken();
        expect(retVal).toBe(mockToken.idToken);
      });

      it('catches exceptions', async () => {
        const mockToken = {
          idToken: 'foo'
        };
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('idToken');
              throw new Error('expected test error');
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        const service = createService();
        const retVal = await service.getIdToken();
        expect(retVal).toBe(undefined);
      });
    });

    describe('getUser', () => {
      it('neither id nor access token = returns undefined', async () => {
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              return Promise.resolve(null);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);

        const service = createService();
        const retVal = await service.getUser();
        expect(retVal).toBe(undefined);
      });


      it('idtoken but no accessToken = returns idToken claims', async () => {
        const mockToken = {
          idToken: 'foo',
          claims: 'baz',
        };
        const mockAuthJS = {
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              if (key === 'idToken') {
                return Promise.resolve(mockToken);
              }
              return Promise.resolve(null);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);

        const service = createService();
        const retVal = await service.getUser();
        expect(retVal).toBe(mockToken.claims);
      });

      it('idtoken and accessToken = calls getUserInfo and returns user object', async () => {
        const mockToken = {
          claims: {
            sub: 'test-sub',
          },
        };
        const userInfo = {
          sub: 'test-sub',
        };
        const mockAuthJS = {
          token: {
            getUserInfo: jest.fn().mockReturnValue(Promise.resolve(userInfo)),
          },
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              if (key === 'idToken' || key === 'accessToken') {
                return Promise.resolve(mockToken);
              }
              return Promise.resolve(null);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);

        const service = createService();
        const retVal = await service.getUser();
        expect(retVal).toBe(userInfo);
      });

      it('idtoken and accessToken but scope-mismatch calls getUserInfo and returns scopes', async () => {
        const mockToken = {
          claims: {
            sub: 'test-sub',
          },
        };
        const userInfo = {
          sub: 'test-sub-other',
        };
        const mockAuthJS = {
          token: {
            getUserInfo: jest.fn().mockReturnValue(Promise.resolve(userInfo)),
          },
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              if (key === 'idToken' || key === 'accessToken') {
                return Promise.resolve(mockToken);
              }
              return Promise.resolve(null);
            })
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);

        const service = createService();
        const retVal = await service.getUser();
        expect(mockAuthJS.token.getUserInfo).toHaveBeenCalled();
        expect(retVal).toBe(mockToken.claims);
      });
    });

    describe('getOktaConfig', () => {
      it('returns normalized config', () => {
        const service = createService({
          client_id: 'foo',
          issuer: 'https://foo',
          redirect_uri: 'https://foo',
          auto_renew: true
        });
        expect(service.getOktaConfig()).toMatchInlineSnapshot(`
          Object {
            "auto_renew": true,
            "clientId": "foo",
            "client_id": "foo",
            "issuer": "https://foo",
            "redirectUri": "https://foo",
            "redirect_uri": "https://foo",
            "responseType": undefined,
            "scopes": Array [
              "openid",
            ],
            "tokenManager": Object {
              "autoRenew": true,
              "storage": undefined,
            },
          }
        `);
      });
    });

    describe('loginRedirect', () => {
      beforeEach(() => {
        const mockAuthJS = {
          token: {
            getWithRedirect: jest.fn()
          },
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
      })
      it('Saves the "referrerPath" in localStorage', async () => {
        localStorage.setItem('referrerPath', '');
        expect(localStorage.getItem('referrerPath')).toBe('');
        const service = createService();
        const uri = 'https://foo.random';
        await service.loginRedirect(uri);
        const val = JSON.parse(localStorage.getItem('referrerPath') || '{}');
        expect(val.uri).toBe(uri);
      });

      it('Sets responseType if none supplied', async () => {
        const service = createService();
        const uri = 'https://foo.random';
        await service.loginRedirect(uri);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith({
          responseType: ['id_token', 'token'],
          scopes: ['openid'],
        })
      });

      it('Accepts additional parameters', async () => {
        const service = createService();
        const uri = 'https://foo.random';
        const params = {
          responseType: ['token', 'something'],
          scopes: ['openid', 'foo'],
          unknownParameter: 'super random',
          unkownSection: {
            other: 'stuff'
          }
        }
        await service.loginRedirect(uri, params);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params);
      });


      it('Will use values for "scopes" and "responseType" from sdk config as base values', async () => {
        const params = {
          scopes: ['foo', 'bar', 'openid'],
          responseType: ['unknown'],
        }
        const service = createService(Object.assign({}, VALID_CONFIG, params));
        const uri = 'https://foo.random';

        await service.loginRedirect(uri);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params);
      });


      it('Values for "scopes" and "responseType" can be completely overridden from base values', async () => {
        const params1 = {
          scopes: ['foo', 'bar', 'openid'],
          responseType: ['unknown'],
        }
        const service = createService(Object.assign({}, VALID_CONFIG, params1));
        const uri = 'https://foo.random';
        const params2 = {
          scopes: ['something', 'different'],
          responseType: ['also', 'different'],
        };
        await service.loginRedirect(uri, params2);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params2);
      });
    });

    describe('handleAuthentication', () => {
      let service: OktaAuthService;
      let tokens: any[];
      let isAuthenticated: boolean;
      beforeEach(() => {
        tokens = [];
        isAuthenticated = false;
        const mockAuthJS = {
          token: {
            parseFromUrl: jest.fn().mockImplementation(() => tokens)
          },
          tokenManager: {
            add: jest.fn()
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        service = createService();
        jest.spyOn(service, 'isAuthenticated').mockImplementation(() => Promise.resolve(isAuthenticated));
        jest.spyOn((service as any).router as any, 'navigate').mockReturnValue(null);
        jest.spyOn(service as any, 'emitAuthenticationState');
      });

      it('calls parseFromUrl', async () => {
        await service.handleAuthentication();
        expect((service as any).oktaAuth.token.parseFromUrl).toHaveBeenCalled();
      });

      it('stores tokens', async () => {
        const accessToken = { accessToken: 'foo' };
        const idToken = { idToken: 'bar' };
        tokens = [accessToken, idToken];
        await service.handleAuthentication();
        expect((service as any).oktaAuth.tokenManager.add).toHaveBeenNthCalledWith(1, 'accessToken', accessToken);
        expect((service as any).oktaAuth.tokenManager.add).toHaveBeenNthCalledWith(2, 'idToken', idToken);
      });

      it('isAuthenticated (false): does not authenticated state', async () => {
        isAuthenticated = false;
        await service.handleAuthentication();
        expect((service as any).emitAuthenticationState).not.toHaveBeenCalled();
      });

      it('isAuthenticated (true): emits authenticated state', async () => {
        isAuthenticated = true;
        await service.handleAuthentication();
        expect((service as any).emitAuthenticationState).toHaveBeenCalled();
      });

      it('navigates to the saved uri', async () => {
        const uri = 'https://fake.test.foo';
        service.setFromUri(uri);
        await service.handleAuthentication();
        expect((service as any).router.navigate).toHaveBeenCalledWith([uri], { queryParams: undefined })
      });
    });

    describe('logout', () => {
      let service: OktaAuthService;
      let mockAuthJS: any;

      function bootstrap(config?: any) {
        mockAuthJS = {
          signOut: jest.fn().mockReturnValue(Promise.resolve()),
          tokenManager: {
            clear: jest.fn(),
          }
        };
        OktaAuth.mockImplementation(() => mockAuthJS);
        service = createService(config);
        jest.spyOn((service as any).router, 'navigate').mockReturnValue(null);
        jest.spyOn(service as any, 'emitAuthenticationState');
      }

      it('calls oktaAuth.signOut', async () => {
        bootstrap();
        await service.logout();
        expect((service as any).oktaAuth.signOut).toHaveBeenCalled();
      });

      it('emits authentication state', async () => {
        bootstrap();
        await service.logout();
        expect((service as any).emitAuthenticationState).toHaveBeenCalledWith(false);
      });

      it('redirects to the root by default', async () => {
        bootstrap();
        await service.logout();
        expect((service as any).router.navigate).toHaveBeenCalledWith(['/']);
      });

      it('accepts an argument for uri to redirect to', async () => {
        bootstrap();
        const uri = 'https://my.custom.uri';
        await service.logout(uri);
        expect((service as any).router.navigate).toHaveBeenCalledWith([uri]);
      });

      it('accepts an options object', async () => {
        bootstrap();
        await service.logout({ foo: 'bar' });
        expect((service as any).router.navigate).toHaveBeenCalledWith(['/']);
      });

      it('Does not call router.navigate if a "postLogoutRedirectUri" option was passed to logout()', async () => {
        bootstrap();
        await service.logout({ postLogoutRedirectUri: 'foo' });
        expect((service as any).router.navigate).not.toHaveBeenCalled();
      });

      it('Does not call router.navigate if a "postLogoutRedirectUri" option was passed to constructor', async () => {
        const config = Object.assign({}, VALID_CONFIG, { postLogoutRedirectUri: 'fake' });
        bootstrap(config);
        await service.logout();
        expect((service as any).router.navigate).not.toHaveBeenCalled();
      });

      it('Returns a promise', async () => {
        bootstrap();
        const res = service.logout();
        expect(typeof res.then).toBe('function');
        expect(typeof res.catch).toBe('function');
        return res;
      });

      it('Can throw', async () => {
        bootstrap();
        const testError = new Error('test error');
        mockAuthJS.signOut.mockReturnValue(Promise.reject(testError));
        return service.logout()
          .catch(e => {
            expect(e).toBe(testError);
          })
          .then(() => {
            expect((service as any).router.navigate).not.toHaveBeenCalled();
          });
      });
    });
  });
});

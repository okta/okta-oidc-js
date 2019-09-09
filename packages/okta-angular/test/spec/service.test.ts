
jest.mock('@okta/okta-auth-js');

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import OktaAuth from '@okta/okta-auth-js';

import PACKAGE_JSON from '../../package.json';

import {
  OktaAuthModule,
  OktaAuthService,
} from '../../src';

const VALID_CONFIG = {
  clientId: 'foo',
  issuer: 'https://foo',
  redirectUri: 'https://foo'
};

describe('Angular service', () => {
  let _mockAuthJS;

  beforeEach(() => {
    OktaAuth.mockClear();
    _mockAuthJS = {
      tokenManager: {
        on: jest.fn()
      }
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function extendMockAuthJS(mockAuthJS) {
    mockAuthJS = mockAuthJS || {};
    mockAuthJS.tokenManager = Object.assign({}, mockAuthJS.tokenManager, {
      on: jest.fn()
    });
    mockAuthJS.token = Object.assign({}, mockAuthJS.token, {
      getWithRedirect: jest.fn()
    });
    return mockAuthJS;
  }

  function extendConfig(config) {
    return Object.assign({}, VALID_CONFIG, config);
  }

  describe('configuration', () => {
    const createInstance = (params = {}) => {
      OktaAuth.mockImplementation(() => _mockAuthJS);
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
    const service = new OktaAuthService(Object.assign({}, VALID_CONFIG, { tokenManager: { secure: true }}), undefined);
    expect(service.getOktaConfig().tokenManager.secure).toBe(true);
  });

  it('Adds a user agent on internal oktaAuth instance', () => {
    const service = new OktaAuthService(VALID_CONFIG, undefined);
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
    function createService(config = null, mockAuthJS = null) {
      OktaAuth.mockImplementation(() => extendMockAuthJS(mockAuthJS));
      config = extendConfig(config);
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
          OktaAuthModule.initAuth(config)
        ],
        providers: [OktaAuthService],
      });
      return TestBed.get(OktaAuthService);
    }

    describe('TokenManager', () => {
      it('Exposes the token manager', () => {
        const service = createService();
        const val = service.getTokenManager();
        expect(val).toBeTruthy();
        expect(val).toBe(service.oktaAuth.tokenManager);
      });

      it('Listens to errors from token manager', () => {
        jest.spyOn(OktaAuthService.prototype, '_onTokenError').mockReturnValue(null);
        const service = createService();
        const val = service.getTokenManager();
        expect(val.on).toHaveBeenCalledWith('error', expect.any(Function));
      });

      it('_onTokenError: calls login for error code "login_required"', () => {
        jest.spyOn(OktaAuthService.prototype, 'login').mockReturnValue(null);
        const service = createService();
        service._onTokenError({ errorCode: 'login_required'});
        expect(OktaAuthService.prototype.login).toHaveBeenCalled();
      });

      it('_onTokenError: ignores other errors', () => {
        jest.spyOn(OktaAuthService.prototype, 'login').mockReturnValue(null);
        const service = createService();
        service._onTokenError({ errorCode: 'something'});
        expect(OktaAuthService.prototype.login).not.toHaveBeenCalled();
      });

      it('Accepts custom function "onTokenError" via config', () => {
        const onTokenError = jest.fn();
        const error = { errorCode: 'some_error' };
        const service = createService({ onTokenError });
        const val = service.getTokenManager();
        expect(val.on).toHaveBeenCalledWith('error', onTokenError);
      });
    });

    describe('isAuthenticated', () => {

      it('Will call a custom function if "config.isAuthenticated" was set', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(null));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(null));

        const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve('foo'));
        const service = createService({ isAuthenticated });
        const ret = await service.isAuthenticated();
        expect(ret).toBe('foo');
        expect(isAuthenticated).toHaveBeenCalled();
        expect(OktaAuthService.prototype.getAccessToken).not.toHaveBeenCalled();
        expect(OktaAuthService.prototype.getIdToken).not.toHaveBeenCalled();
      });

      it('returns false if no access or id token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(null));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(null));

        const service = createService();
        const val = await service.isAuthenticated();
        expect(val).toBe(false);
      });


      it('returns true if access token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve('something'));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(null));

        const service = createService();
        const val = await service.isAuthenticated();
        expect(val).toBe(true);
      });

      it('returns true if id token', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(null));
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
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('accessToken');
              return Promise.resolve(mockToken);
            })
          }
        });

        const service = createService(null, mockAuthJS);
        const retVal = await service.getAccessToken();
        expect(retVal).toBe(mockToken.accessToken);
      });

      it('catches exceptions', async () => {
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('accessToken');
              throw new Error('expected test error');
            })
          }
        });

        const service = createService(null, mockAuthJS);
        const retVal = await service.getAccessToken();
        expect(retVal).toBe(undefined);
      });
    });

    describe('getIdToken', () => {
      it('retrieves token from token manager', async () => {
        const mockToken = {
          idToken: 'foo'
        };
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('idToken');
              return Promise.resolve(mockToken);
            })
          }
        });
        const service = createService(null, mockAuthJS);
        const retVal = await service.getIdToken();
        expect(retVal).toBe(mockToken.idToken);
      });

      it('catches exceptions', async () => {
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('idToken');
              throw new Error('expected test error');
            })
          }
        });
        const service = createService(null, mockAuthJS);
        const retVal = await service.getIdToken();
        expect(retVal).toBe(undefined);
      });
    });

    describe('getUser', () => {
      it('neither id nor access token = returns undefined', async () => {
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              return Promise.resolve(null);
            })
          }
        });
        const service = createService(null, mockAuthJS);
        const retVal = await service.getUser();
        expect(retVal).toBe(undefined);
      });


      it('idtoken but no accessToken = returns idToken claims', async () => {
        const mockToken = {
          idToken: 'foo',
          claims: 'baz',
        };
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              if (key === 'idToken') {
                return Promise.resolve(mockToken);
              }
              return Promise.resolve(null);
            })
          }
        });

        const service = createService(null, mockAuthJS);
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
        const mockAuthJS = extendMockAuthJS({
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
        });

        const service = createService(null, mockAuthJS);
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
        const mockAuthJS = extendMockAuthJS({
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
        });

        const service = createService(null, mockAuthJS);
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

    describe('setFromUri', () => {
      it('Saves the "referrerPath" in localStorage', () => {
        localStorage.setItem('referrerPath', '');
        expect(localStorage.getItem('referrerPath')).toBe('');
        const service = createService();
        const uri = 'https://foo.random';
        service.setFromUri(uri);
        const val = JSON.parse(localStorage.getItem('referrerPath'));
        expect(val.uri).toBe(uri);
      });
    });

    describe('getFromUri', () => {
      test('cleares referrer from localStorage', () => {
        const TEST_VALUE = 'foo-bar';
        localStorage.setItem('referrerPath', JSON.stringify({ uri: TEST_VALUE }));
        const service = createService();
        const res = service.getFromUri();
        expect(res.uri).toBe(TEST_VALUE);
        expect(localStorage.getItem('referrerPath')).not.toBeTruthy();
      });
    });

    describe('login', () => {
      const expectedRes = 'sometestresult';
      beforeEach(() => {
        jest.spyOn(OktaAuthService.prototype, 'loginRedirect').mockReturnValue(expectedRes);
      });
      it('calls loginRedirect by default', () => {
        const service = createService();
        const res = service.login();
        expect(res).toBe(expectedRes);
        expect(OktaAuthService.prototype.loginRedirect).toHaveBeenCalled();
      });

      it('calls onAuthRequired, if provided, instead of loginRedirect', () => {
        const onAuthRequired = jest.fn().mockReturnValue(expectedRes);
        const service = createService({ onAuthRequired });
        const res = service.login();
        expect(res).toBe(expectedRes);
        expect(OktaAuthService.prototype.loginRedirect).not.toHaveBeenCalled();
        expect(onAuthRequired).toHaveBeenCalledWith(service, service.router);
      });

      it('Calls setFromUri with fromUri, if provided', () => {
        jest.spyOn(OktaAuthService.prototype, 'setFromUri').mockReturnValue(null);
        const fromUri = 'notrandom';
        const service = createService();
        service.login(fromUri);
        expect(OktaAuthService.prototype.setFromUri).toHaveBeenCalledWith(fromUri);
      });

      it('Calls setFromUri with window.location.pathname, by default', () => {
        jest.spyOn(OktaAuthService.prototype, 'setFromUri').mockReturnValue(null);
        const service = createService();
        service.login();
        expect(OktaAuthService.prototype.setFromUri).toHaveBeenCalledWith(window.location.pathname);
      });

      it('Passes "fromUri" and "additionalParams" to loginRedirect', () => {
        jest.spyOn(OktaAuthService.prototype, 'loginRedirect').mockReturnValue(null);
        const service = createService();
        const fromUri = 'https://foo.random';
        const additionalParams = { foo: 'bar', baz: 'biz' };
        service.login(fromUri, additionalParams);
        expect(OktaAuthService.prototype.loginRedirect).toHaveBeenCalledWith(fromUri, additionalParams);
      });

    });

    describe('loginRedirect', () => {

      it('Saves the "referrerPath" in localStorage', async () => {
        localStorage.setItem('referrerPath', '');
        expect(localStorage.getItem('referrerPath')).toBe('');
        const service = createService();
        const uri = 'https://foo.random';
        await service.loginRedirect(uri);
        const val = JSON.parse(localStorage.getItem('referrerPath'));
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
        const service = createService(extendConfig(params));
        const uri = 'https://foo.random';

        await service.loginRedirect(uri);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params);
      });


      it('Values for "scopes" and "responseType" can be completely overridden from base values', async () => {
        const params1 = {
          scopes: ['foo', 'bar', 'openid'],
          responseType: ['unknown'],
        }
        const service = createService(extendConfig(params1));
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
      let service;
      let tokens;
      let isAuthenticated;
      beforeEach(() => {
        tokens = [];
        isAuthenticated = false;
        const mockAuthJS = extendMockAuthJS({
          token: {
            parseFromUrl: jest.fn().mockImplementation(() => tokens)
          },
          tokenManager: {
            add: jest.fn()
          }
        });
        service = createService(null, mockAuthJS);
        jest.spyOn(service, 'isAuthenticated').mockImplementation(() => Promise.resolve(isAuthenticated));
        jest.spyOn(service.router, 'navigate').mockReturnValue(null);
        jest.spyOn(service, 'emitAuthenticationState');
      });

      it('calls parseFromUrl', async () => {
        await service.handleAuthentication();
        expect(service.oktaAuth.token.parseFromUrl).toHaveBeenCalled();
      });

      it('stores tokens', async () => {
        const accessToken = { accessToken: 'foo' };
        const idToken = { idToken: 'bar' };
        tokens = [accessToken, idToken];

        await service.handleAuthentication();
        expect(service.oktaAuth.tokenManager.add).toHaveBeenNthCalledWith(1, 'accessToken', accessToken);
        expect(service.oktaAuth.tokenManager.add).toHaveBeenNthCalledWith(2, 'idToken', idToken);
      });

      it('isAuthenticated (false): does not authenticated state', async () => {
        isAuthenticated = false;
        await service.handleAuthentication();
        expect(service.emitAuthenticationState).not.toHaveBeenCalled();
      });

      it('isAuthenticated (true): emits authenticated state', async () => {
        isAuthenticated = true;
        await service.handleAuthentication();
        expect(service.emitAuthenticationState).toHaveBeenCalled();
      });

      it('navigates to the saved uri', async () => {
        const uri = 'https://fake.test.foo';
        service.setFromUri(uri);
        await service.handleAuthentication();
        expect(service.router.navigate).toHaveBeenCalledWith([uri], { queryParams: undefined });
      });
    });

    describe('logout', () => {
      let service;
      beforeEach(() => {
        const mockAuthJS = extendMockAuthJS({
          signOut: jest.fn(),
          tokenManager: {
            clear: jest.fn(),
          }
        });
        service = createService(null, mockAuthJS);
        jest.spyOn(service.router, 'navigate').mockReturnValue(null);
        jest.spyOn(service, 'emitAuthenticationState');
      });

      it('clears the token manager', async () => {
        await service.logout();
        expect(service.oktaAuth.tokenManager.clear).toHaveBeenCalled();
      });

      it('calls oktaAuth.signOut', async () => {
        await service.logout();
        expect(service.oktaAuth.signOut).toHaveBeenCalled();
      });

      it('emits authentication state', async () => {
        await service.logout();
        expect(service.emitAuthenticationState).toHaveBeenCalledWith(false);
      });

      it('redirects to the root by default', async () => {
        await service.logout();
        expect(service.router.navigate).toHaveBeenCalledWith(['/']);
      });

      it('accepts an argument for uri to redirect to', async () => {
        const uri = 'https://my.custom.uri';
        await service.logout(uri);
        expect(service.router.navigate).toHaveBeenCalledWith([uri]);
      });
    });
  });
});

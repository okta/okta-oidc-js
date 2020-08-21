
jest.mock('@okta/okta-auth-js');

import { TestBed } from '@angular/core/testing';
import OktaAuth from '@okta/okta-auth-js';

import PACKAGE_JSON from '../../package.json';

import {
  OktaAuthModule,
  OktaAuthService,
  OktaConfig,
  OKTA_CONFIG,
} from '../../src/okta-angular';
import { Injector } from '@angular/core';

describe('Angular service', () => {
  let _mockAuthJS: any;
  let VALID_CONFIG: OktaConfig;

  beforeEach(() => {
    VALID_CONFIG = {
      clientId: 'foo',
      issuer: 'https://foo',
      redirectUri: 'https://foo'
    };
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

  function extendMockAuthJS(mockAuthJS: any) {
    mockAuthJS = mockAuthJS || {};
    mockAuthJS.tokenManager = Object.assign({}, mockAuthJS.tokenManager, {
      on: jest.fn()
    });
    mockAuthJS.token = Object.assign({}, mockAuthJS.token, {
      getWithRedirect: jest.fn()
    });
    return mockAuthJS;
  }

  function extendConfig(config: object) {
    return Object.assign({}, VALID_CONFIG, config);
  }

  const createInstance = (params = {}) => {
    OktaAuth.mockImplementation(() => _mockAuthJS);
    const injector: unknown = undefined;
    return () => new OktaAuthService(params, injector as Injector);
  };

  describe('configuration', () => {
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

    it('sets default scopes if none are provided', () => {
      const service =  createInstance(VALID_CONFIG)();
      expect(service.getOktaConfig()).toMatchInlineSnapshot(`
      Object {
        "clientId": "foo",
        "issuer": "https://foo",
        "redirectUri": "https://foo",
        "scopes": Array [
          "openid",
          "email",
        ],
      }
    `);
    });
    it('will add "openid" scope if not present', () => {
      const config = createInstance(extendConfig({ scopes: ['foo'] }))().getOktaConfig();
      expect(config.scopes).toMatchInlineSnapshot(`
        Array [
          "openid",
          "foo",
        ]
      `);
    });
  });

  it('Can set the https secure cookie setting', () => {
    const service = createInstance(extendConfig({ tokenManager: { secure: true }}))();
    const tmConfig = service.getOktaConfig().tokenManager;
    expect(tmConfig).toBeDefined();
    expect((tmConfig || {}).secure).toBe(true);
  });

  it('Adds a user agent on internal oktaAuth instance', () => {
    const service = createInstance(VALID_CONFIG)();
    expect(service['oktaAuth'].userAgent.indexOf(`@okta/okta-angular/${PACKAGE_JSON.version}`)).toBeGreaterThan(-1);
  });

  it('Can create the service via angular injection', () => {
    TestBed.configureTestingModule({
      imports: [
        OktaAuthModule
      ],
      providers: [
        OktaAuthService,
        {
          provide: OKTA_CONFIG,
          useValue: VALID_CONFIG
        },
      ],
    });
    const service = TestBed.get(OktaAuthService);
    expect(service.config).toMatchInlineSnapshot(`
      Object {
        "clientId": "foo",
        "issuer": "https://foo",
        "redirectUri": "https://foo",
        "scopes": Array [
          "openid",
          "email",
        ],
      }
    `);
  });

  describe('service methods', () => {
    function createService(config?: object, mockAuthJS = null) {
      OktaAuth.mockImplementation(() => extendMockAuthJS(mockAuthJS));
      config = extendConfig(config || {});
      TestBed.configureTestingModule({
        imports: [
          OktaAuthModule
        ],
        providers: [
          OktaAuthService,
          {
            provide: OKTA_CONFIG,
            useValue: config
          },
        ],
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
    });

    describe('onSessionExpired', () => {
      it('By default, "onSessionExpired" is undefined', () => {
        jest.spyOn(OktaAuthService.prototype, 'login').mockReturnValue(undefined);
        const service = createService();
        const config = service.getOktaConfig();
        expect(config.onSessionExpired).toBeUndefined();
      });

      it('Accepts custom function "onSessionExpired" via config which disables default handler', () => {
        jest.spyOn(OktaAuthService.prototype, 'login').mockReturnValue(undefined);
        const onSessionExpired = jest.fn();
        const service = createService({ onSessionExpired });
        const config = service.getOktaConfig();
        expect(config.onSessionExpired).toBe(onSessionExpired);
        config.onSessionExpired();
        expect(onSessionExpired).toHaveBeenCalled();
        expect(OktaAuthService.prototype.login).not.toHaveBeenCalled();
      });
    });

    describe('isAuthenticated', () => {

      it('Will call a custom function if "config.isAuthenticated" was set', async () => {
        jest.spyOn(OktaAuthService.prototype, 'getAccessToken').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(OktaAuthService.prototype, 'getIdToken').mockReturnValue(Promise.resolve(undefined));

        const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve('foo'));
        const service = createService({ isAuthenticated });
        const ret = await service.isAuthenticated();
        expect(ret).toBe('foo');
        expect(isAuthenticated).toHaveBeenCalledWith(service);
        expect(OktaAuthService.prototype.getAccessToken).not.toHaveBeenCalled();
        expect(OktaAuthService.prototype.getIdToken).not.toHaveBeenCalled();
      });

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
        const mockAuthJS = extendMockAuthJS({
          tokenManager: {
            get: jest.fn().mockImplementation(key => {
              expect(key).toBe('accessToken');
              return Promise.resolve(mockToken);
            })
          }
        });
        const service = createService(undefined, mockAuthJS);
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
        const service = createService(undefined, mockAuthJS);
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
        const service = createService(undefined, mockAuthJS);
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
        const service = createService(undefined, mockAuthJS);
        const retVal = await service.getIdToken();
        expect(retVal).toBe(undefined);
      });
    });

    describe('getUser', () => {
      it('should resolve userInfo from AuthJS getUserInfo', async () => {
        const userInfo = {
          sub: 'test-sub',
        };
        const mockAuthJS = extendMockAuthJS({
          token: {
            getUserInfo: jest.fn().mockResolvedValueOnce(userInfo),
          }
        });
        const service = createService(undefined, mockAuthJS);
        const retVal = await service.getUser();
        expect(retVal).toBe(userInfo);
      });

      it('should throw error when AuthJS getUserInfo cannot resolve userInfo', async () => {
        const mockAuthJS = extendMockAuthJS({
          token: {
            getUserInfo: jest.fn().mockRejectedValueOnce(new Error('mock error')),
          }
        });
        const service = createService(undefined, mockAuthJS);
        try {
          await service.getUser();
        } catch (err) {
          expect(err.message).toBe('mock error');
        }
      });
    });

    describe('getOktaConfig', () => {
      it('returns config', () => {
        const service = createService(VALID_CONFIG);
        expect(service.getOktaConfig()).toMatchInlineSnapshot(`
          Object {
            "clientId": "foo",
            "issuer": "https://foo",
            "redirectUri": "https://foo",
            "scopes": Array [
              "openid",
              "email",
            ],
          }
        `);
      });
    });

    describe('setFromUri', () => {
      it('Saves the "referrerPath" in sessionStorage', () => {
        sessionStorage.setItem('referrerPath', '');
        expect(sessionStorage.getItem('referrerPath')).toBe('');
        const service = createService();
        const uri = 'https://foo.random';
        service.setFromUri(uri);
        const val = sessionStorage.getItem('referrerPath');
        expect(val).toBe(uri);
      });
      it('Saves the window.location.href by default', () => {
        sessionStorage.setItem('referrerPath', '');
        expect(sessionStorage.getItem('referrerPath')).toBe('');
        const service = createService();
        service.setFromUri();
        const val = sessionStorage.getItem('referrerPath');
        expect(val).toBe(window.location.href);
      });
    });

    describe('getFromUri', () => {
      it('cleares referrer from localStorage', () => {
        const TEST_VALUE = 'foo-bar';
        sessionStorage.setItem('referrerPath', TEST_VALUE);
        const service = createService();
        const res = service.getFromUri();
        expect(res).toBe(TEST_VALUE);
        expect(sessionStorage.getItem('referrerPath')).not.toBeTruthy();
      });
      it('returns window.location.origin if nothing was set', () => {
        sessionStorage.setItem('referrerPath', '');
        const service = createService();
        const res = service.getFromUri();
        expect(res).toBe(window.location.origin);
        expect(sessionStorage.getItem('referrerPath')).not.toBeTruthy();
      });
    });

    describe('login', () => {
      const expectedRes = 'sometestresult';
      beforeEach(() => {
        jest.spyOn(OktaAuthService.prototype, 'loginRedirect').mockReturnValue(expectedRes);
        jest.spyOn(OktaAuthService.prototype, 'setFromUri').mockReturnValue(undefined);
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
        const injector = TestBed.get(Injector);
        const res = service.login();
        expect(res).toBe(expectedRes);
        expect(OktaAuthService.prototype.loginRedirect).not.toHaveBeenCalled();
        expect(onAuthRequired).toHaveBeenCalledWith(service, injector);
      });

      it('Calls setFromUri with fromUri, if provided', () => {
        const fromUri = 'notrandom';
        const service = createService();
        service.login(fromUri);
        expect(OktaAuthService.prototype.setFromUri).toHaveBeenCalledWith(fromUri);
      });

      it('Calls setFromUri with undefined, by default', () => {
        jest.spyOn(OktaAuthService.prototype, 'setFromUri').mockReturnValue(undefined);
        const service = createService();
        const routerUrl = '/fakevalue?superfake#withhash';
        service.router = {
          url: routerUrl
        };
        service.login();
        expect(OktaAuthService.prototype.setFromUri).toHaveBeenCalledWith(undefined);
      });

      it('Passes "additionalParams" to loginRedirect', () => {
        jest.spyOn(OktaAuthService.prototype, 'loginRedirect').mockReturnValue(null);
        const service = createService();
        const fromUri = 'https://foo.random';
        const additionalParams = { foo: 'bar', baz: 'biz' };
        service.login(fromUri, additionalParams);
        expect(OktaAuthService.prototype.loginRedirect).toHaveBeenCalledWith(undefined, additionalParams);
        expect(OktaAuthService.prototype.setFromUri).toHaveBeenCalledWith(fromUri);
      });

    });

    describe('loginRedirect', () => {
      beforeEach(() => {
        jest.spyOn(OktaAuthService.prototype, 'setFromUri').mockReturnValue(undefined);
      });
      it('If a URI is passed, it calls setFromUri', async () => {
        const service = createService();
        const uri = 'https://foo.random';
        await service.loginRedirect(uri);
        expect(service.setFromUri).toHaveBeenCalledWith(uri);
      });

      it('If no URI is passed, it does not call setFromUri', async () => {
        const service = createService();
        await service.loginRedirect();
        expect(service.setFromUri).not.toHaveBeenCalled();
      });

      it('Sets responseType and scopes from config if none supplied', async () => {
        const service = createService({ responseType: ['fake'], scopes: ['openid', 'fake']});
        const uri = 'https://foo.random';
        await service.loginRedirect(uri);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith({
          responseType: ['fake'],
          scopes: ['openid', 'fake'],
        });
      });

      it('Accepts additional parameters, which override config values', async () => {
        const service = createService();
        const uri = 'https://foo.random';
        const params = {
          responseType: ['token', 'something'],
          scopes: ['openid', 'foo'],
          unknownParameter: 'super random',
          unkownSection: {
            other: 'stuff'
          }
        };
        await service.loginRedirect(uri, params);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params);
      });


      it('Will use values for "scopes" and "responseType" from sdk config as base values', async () => {
        const params = {
          scopes: ['foo', 'bar', 'openid'],
          responseType: ['unknown'],
        };
        const service = createService(extendConfig(params));
        const uri = 'https://foo.random';

        await service.loginRedirect(uri);
        expect(service.oktaAuth.token.getWithRedirect).toHaveBeenCalledWith(params);
      });


      it('Values for "scopes" and "responseType" can be completely overridden from base values', async () => {
        const params1 = {
          scopes: ['foo', 'bar', 'openid'],
          responseType: ['unknown'],
        };
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
      let service: OktaAuthService;
      let response: ParseFromUrlResponse;
      let isAuthenticated: boolean;
      beforeEach(() => {
        response = {
          tokens: {},
          state: 'abc'
        };
        isAuthenticated = false;
        const mockAuthJS = extendMockAuthJS({
          token: {
            parseFromUrl: jest.fn().mockImplementation(() => response)
          },
          tokenManager: {
            add: jest.fn()
          }
        });
        service = createService(undefined, mockAuthJS);
        jest.spyOn(service, 'isAuthenticated').mockImplementation(() => Promise.resolve(isAuthenticated));
        jest.spyOn(service as any, 'emitAuthenticationState');
      });

      it('calls parseFromUrl', async () => {
        await service.handleAuthentication();
        expect((service as any).oktaAuth.token.parseFromUrl).toHaveBeenCalled();
      });

      it('stores tokens', async () => {
        const accessToken = { accessToken: 'foo' };
        const idToken = { idToken: 'bar' };
        response.tokens = { accessToken, idToken };
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
    });

    describe('logout', () => {
      let service: OktaAuthService;
      let mockAuthJS: any;

      function bootstrap(config?: any) {
        mockAuthJS = extendMockAuthJS({
          signOut: jest.fn().mockReturnValue(Promise.resolve()),
          tokenManager: {
            clear: jest.fn(),
          }
        });
        service = createService(config, mockAuthJS);
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

      it('can be called with no options', async () => {
        bootstrap();
        await service.logout();
        expect((service as any).oktaAuth.signOut).toHaveBeenCalledWith({});
      });

      it('accepts an argument for uri to redirect to', async () => {
        bootstrap();
        const uri = 'https://my.custom.uri';
        await service.logout(uri);
        expect((service as any).oktaAuth.signOut).toHaveBeenCalledWith({
          postLogoutRedirectUri: uri
        });
      });

      it('converts relative path to absolute uri', async () => {
        bootstrap();
        const uri = '/relative-path';
        await service.logout(uri);
        expect((service as any).oktaAuth.signOut).toHaveBeenCalledWith({
          postLogoutRedirectUri: window.location.origin + uri
        });
      });


      it('accepts an options object', async () => {
        bootstrap();
        const options = { foo: 'bar' };
        await service.logout(options);
        expect((service as any).oktaAuth.signOut).toHaveBeenCalledWith(options);
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
            expect((service as any).emitAuthenticationState).not.toHaveBeenCalled();
          });
      });
    });
  });
});

jest.mock('@okta/okta-auth-js');

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import OktaAuth from '@okta/okta-auth-js';

import {
  OktaAuthModule,
  OktaAuthService,
  OktaAuthGuard,
} from '../../src/okta-angular';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, RouterState } from '@angular/router';

const VALID_CONFIG = {
  clientId: 'foo',
  issuer: 'https://foo',
  redirectUri: 'https://foo'
};

function createService(options: any) {
  options = options || {};

  const oktaAuth = options.oktaAuth || {};
  oktaAuth.tokenManager = oktaAuth.tokenManager || { on: jest.fn() };
  OktaAuth.mockImplementation(() => oktaAuth);

  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      OktaAuthModule.initAuth(VALID_CONFIG)
    ],
    providers: [OktaAuthService],
  });
  const service = TestBed.get(OktaAuthService);
  service.getTokenManager = jest.fn().mockReturnValue({ on: jest.fn() });
  service.isAuthenticated = jest.fn().mockReturnValue(Promise.resolve(options.isAuthenticated));
  service.setFromUri = jest.fn();
  service.loginRedirect = jest.fn();
  return service;
}

describe('Angular auth guard', () => {

  beforeEach(() => {
    OktaAuth.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const service = createService({ isAuthenticated: true });
        const router: unknown = undefined;
        const guard = new OktaAuthGuard(service, router as Router);
        const route: unknown = undefined;
        const state: unknown = undefined;
        const res = await guard.canActivate(route as ActivatedRouteSnapshot, state as RouterStateSnapshot);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let service: OktaAuthService;
      let guard: OktaAuthGuard;
      let state: RouterStateSnapshot;
      let route: ActivatedRouteSnapshot;
      let router: Router;
      beforeEach(() => {
        service = createService({ isAuthenticated: false });
        router = TestBed.get(Router);
        guard = new OktaAuthGuard(service, router);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
      });

      it('returns false', async () => {
        const config = service.getOktaConfig();
        const res = await guard.canActivate(route, state);
        expect(res).toBe(false);
      });

      it('by default, calls "loginRedirect()"', async () => {
        const config = service.getOktaConfig();
        const res = await guard.canActivate(route, state);
        expect(service.loginRedirect).toHaveBeenCalled();
      });

      it('calls "setFromUri" with baseUrl and query object', async () => {
        const baseUrl = 'http://fake.url/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        state.url = `${baseUrl}${query}${hash}`;
        const queryObj = { 'bar': 'baz' };
        route.queryParams = queryObj;
        const res = await guard.canActivate(route, state);
        expect(service.setFromUri).toHaveBeenCalledWith(baseUrl, queryObj);
      });

      it('onAuthRequired can be set on route', async () => {
        const fn = route.data['onAuthRequired'] = jest.fn();
        const res = await guard.canActivate(route, state);
        expect(fn).toHaveBeenCalledWith(service, router as Router);
      });

      it('onAuthRequired can be set on config', async () => {
        const config = service.getOktaConfig();
        const fn = config.onAuthRequired = jest.fn();

        const res = await guard.canActivate(route, state);
        expect(fn).toHaveBeenCalledWith(service, router as Router);
      });
    });
  });

  it('Can create the guard via angular injection', () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule.initAuth(VALID_CONFIG)
      ],
      providers: [OktaAuthService, OktaAuthGuard],
    });
    const guard = TestBed.get(OktaAuthGuard);
    expect(guard.oktaAuth).toBeTruthy();
    expect(guard.router).toBeTruthy();
    expect(typeof guard.canActivate).toBe('function');
  });
});

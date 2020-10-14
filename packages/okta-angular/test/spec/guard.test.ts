import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  OktaAuthModule,
  OktaAuthService,
  OktaAuthGuard,
  OKTA_CONFIG,
} from '../../src/okta-angular';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, RouterState } from '@angular/router';
import { Injector } from '@angular/core';

const VALID_CONFIG = {
  clientId: 'foo',
  issuer: 'https://foo',
  redirectUri: 'https://foo'
};

function createService(options: any) {
  options = options || {};

  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
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
  service.getTokenManager = jest.fn().mockReturnValue({ on: jest.fn() });
  service.isAuthenticated = jest.fn().mockReturnValue(Promise.resolve(options.isAuthenticated));
  service.setFromUri = jest.fn();
  service.loginRedirect = jest.fn();
  return service;
}

describe('Angular auth guard', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const service = createService({ isAuthenticated: true });
        const injector: unknown = undefined;
        const guard = new OktaAuthGuard(service, injector as Injector);
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
      let injector: Injector;
      beforeEach(() => {
        service = createService({ isAuthenticated: false });
        router = TestBed.get(Router);
        injector = TestBed.get(Injector);
        guard = new OktaAuthGuard(service, injector);
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

      it('calls "setFromUri" with state url', async () => {
        const baseUrl = 'http://fake.url/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        state.url = `${baseUrl}${query}${hash}`;
        const queryObj = { 'bar': 'baz' };
        route.queryParams = queryObj;
        const res = await guard.canActivate(route, state);
        expect(service.setFromUri).toHaveBeenCalledWith(state.url);
      });

      it('onAuthRequired can be set on route', async () => {
        const fn = route.data['onAuthRequired'] = jest.fn();
        const res = await guard.canActivate(route, state);
        expect(fn).toHaveBeenCalledWith(service, injector);
      });

      it('onAuthRequired can be set on config', async () => {
        const config = service.getOktaConfig();
        const fn = config.onAuthRequired = jest.fn();

        const res = await guard.canActivate(route, state);
        expect(fn).toHaveBeenCalledWith(service, injector);
      });
    });
  });

  describe('canActivateChild', () => {
    it('calls canActivate', () => {
      const service = createService({ isAuthenticated: false });
      const injector = TestBed.get(Injector);
      const guard = new OktaAuthGuard(service, injector);
      const router = TestBed.get(Router);
      const routerState: RouterState = router.routerState;
      const state = routerState.snapshot;
      const route = state.root;

      jest.spyOn(guard, 'canActivate').mockReturnValue(Promise.resolve(true));
      guard.canActivateChild(route, state);
      expect(guard.canActivate).toHaveBeenCalledWith(route, state);
    });
  });

  it('Can create the guard via angular injection', () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule
      ],
      providers: [
        OktaAuthService,
        OktaAuthGuard,
        {
          provide: OKTA_CONFIG,
          useValue: VALID_CONFIG
        },
      ],
    });
    const guard = TestBed.get(OktaAuthGuard);
    expect(guard.oktaAuth).toBeTruthy();
    expect(guard.injector).toBeTruthy();
    expect(typeof guard.canActivate).toBe('function');
  });
});

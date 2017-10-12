import {
  AppPage,
  OktaSignInPage,
  LoginPage,
  ProtectedPage,
  SessionTokenSignInPage
} from './page-objects';

import { environment } from '../src/environments/environment';
import { Utils } from './utils';

describe('Angular + Okta App', () => {
  let page: AppPage;
  let oktaLoginPage: OktaSignInPage;
  let loginPage: LoginPage;
  let protectedPage: ProtectedPage;
  let sessionTokenSignInPage: SessionTokenSignInPage;

  beforeEach(() => {
    page = new AppPage();
    loginPage = new LoginPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
    sessionTokenSignInPage = new SessionTokenSignInPage();
  });

  it('should redirect to Okta for login when trying to access a protected page', () => {
    protectedPage.navigateTo();

    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: environment.USERNAME,
      password: environment.PASSWORD
    });

    protectedPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    /**
     * Logout
     */
    protectedPage.getLogoutButton().click();
    expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
  });

  /**
   * Hack to slowdown the tests due to the Okta session
   * not being removed in time for the second login call.
   */
  const util = new Utils();
  util.slowDown(100);

  it('should redirect to Okta for login', () => {
    loginPage.navigateTo();

    oktaLoginPage.waitUntilVisible();

    oktaLoginPage.signIn({
      username: environment.USERNAME,
      password: environment.PASSWORD
    });

    loginPage.waitUntilVisible();
    expect(loginPage.getLogoutButton().isPresent()).toBeTruthy();

    /**
     * Logout
     */
    loginPage.getLogoutButton().click();
    expect(loginPage.getLoginButton().isPresent()).toBeTruthy();
  });

  it('should allow passing sessionToken to skip Okta login', () => {
    sessionTokenSignInPage.navigateTo();

    sessionTokenSignInPage.waitUntilVisible();

    sessionTokenSignInPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    page.waitUntilLoggedIn();
    expect(page.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    page.getLogoutButton().click();

    page.waitUntilLoggedOut();
  });
});

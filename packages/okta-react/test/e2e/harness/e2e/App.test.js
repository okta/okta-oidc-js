import {
  AppPage,
  OktaSignInPage,
  LoginPage,
  ProtectedPage
} from './page-objects';

import { Utils } from './utils';

describe('React + Okta App', () => {
  let page;
  let oktaLoginPage;
  let loginPage;
  let protectedPage;

  beforeEach(() => {
    page = new AppPage();
    loginPage = new LoginPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
  });

  it('should redirect to Okta for login when trying to access a protected page', () => {
    protectedPage.navigateTo();

    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    protectedPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    protectedPage.getLogoutButton().click();
  });

  /**
   * Hack to slowdown the tests due to the Okta session
   * not being removed in time for the second login call.
   */
  const util = new Utils();
  util.slowDown(100);

  it('should redirect to Okta for login', () => {
    loginPage.navigateTo();

    loginPage.getLoginButton().click();

    oktaLoginPage.waitUntilVisible();

    oktaLoginPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    loginPage.waitUntilVisible();
    expect(loginPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    loginPage.getLogoutButton().click();
  });
});

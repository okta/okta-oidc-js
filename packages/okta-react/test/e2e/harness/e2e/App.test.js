import {
  AppPage,
  OktaSignInPage,
  ProtectedPage
} from './page-objects';

import { Utils } from './utils';

describe('React + Okta App', () => {
  let appPage;
  let oktaLoginPage;
  let protectedPage;

  beforeEach(() => {
    appPage = new AppPage();
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
    appPage.navigateTo();

    appPage.waitUntilVisible();

    appPage.getLoginButton().click();

    oktaLoginPage.waitUntilVisible();

    oktaLoginPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    appPage.waitUntilVisible();
    expect(appPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    appPage.getLogoutButton().click();
  });
});

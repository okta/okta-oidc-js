import {
  AppPage,
  OktaSignInPage,
  LoginPage,
  ProtectedPage
} from './page-objects';

import { Constants } from './constants';
import { Utils } from './utils';

// Hack to slowdown the tests due to the Okta session
// not being removed in time for the second login call
const util = new Utils();
util.slowDown(50);

describe('Angular + Okta App', () => {
  let page: AppPage;
  let oktaLoginPage: OktaSignInPage;
  let loginPage: LoginPage;
  let protectedPage: ProtectedPage;

  beforeEach(() => {
    page = new AppPage();
    loginPage = new LoginPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
  });

  it('should have a home button', () => {
    page.navigateTo();
    expect(page.getHomeButton().isPresent()).toBeTruthy();
  });

  it('should have a login button', () => {
    page.navigateTo();
    expect(page.getLoginButton().isPresent()).toBeTruthy();
  });

  it('should not have a logout button', () => {
    page.navigateTo();
    expect(page.getLogoutButton().isPresent()).toBeFalsy();
  });

  it('should have a protected button', () => {
    page.navigateTo();
    expect(page.getProtectedButton().isPresent()).toBeTruthy();
  });

  it('should redirect to Okta for login when trying to access a protected page', () => {
    protectedPage.navigateTo();

    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: Constants.USERNAME,
      password: Constants.PASSWORD
    });

    protectedPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    protectedPage.getLogoutButton().click();
    expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
  });

  it('should redirect back to home', () => {
    page.navigateTo();
    expect(page.getHomeButton().isPresent()).toBeTruthy();
  });

  it('should redirect to Okta for login', () => {
    loginPage.navigateTo();

    oktaLoginPage.waitUntilVisible();

    oktaLoginPage.signIn({
      username: Constants.USERNAME,
      password: Constants.PASSWORD
    });

    loginPage.waitUntilVisible();
    expect(loginPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    loginPage.getLogoutButton().click();
    expect(loginPage.getLoginButton().isPresent()).toBeTruthy();
  });
});

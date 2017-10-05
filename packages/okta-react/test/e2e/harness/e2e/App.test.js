import {
  AppPage,
  OktaSignInPage,
  ProtectedPage,
  SessionTokenSignInPage
} from './page-objects';

describe('React + Okta App', () => {
  let appPage;
  let oktaLoginPage;
  let protectedPage;
  let sessionTokenSignInPage;

  beforeEach(() => {
    appPage = new AppPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
    sessionTokenSignInPage = new SessionTokenSignInPage();
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

    appPage.waitUntilLoggedOut();
  });

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

    appPage.waitUntilLoggedOut();
  });

  it('should allow passing sessionToken to skip Okta login', () => {
    sessionTokenSignInPage.navigateTo();

    sessionTokenSignInPage.waitUntilVisible();

    sessionTokenSignInPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    appPage.waitUntilLoggedIn();
    expect(appPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    appPage.getLogoutButton().click();

    appPage.waitUntilLoggedOut();
  });
});

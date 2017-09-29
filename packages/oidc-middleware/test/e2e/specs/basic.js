const util = require('../util/util');
const constants = require('../util/constants');
const OktaSignInPage = require('../page-objects/OktaSignInPage');
const ProtectedPage = require('../page-objects/ProtectedPage');
const HomePage = require('../page-objects/HomePage');

browser.waitForAngularEnabled(false);

describe('Basic login redirect', () => {

  let server;
  beforeEach(async () => {
    server = util.createDemoServer();
    await server.start();
  });

  afterEach(async () => await server.stop());

  it('should redirect to Okta if login is required, then return to the protected page', async () => {
    // attempt to navigate to a protected page
    const privatePage = new ProtectedPage();
    await privatePage.load();

    // we're not logged in, so we should redirect
    const signInPage = new OktaSignInPage();
    await signInPage.waitUntilVisible();
    await signInPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // wait for protected page to appear with contents
    await privatePage.waitUntilVisible();
    expect(privatePage.getBodyText()).toContain('sub');

    // navigate to home page
    const homePage = new HomePage();
    await homePage.load();
    await homePage.waitUntilVisible();
    expect(homePage.getBodyText()).toContain('Welcome home');

    // navigate to logout
    await browser.get(constants.LOGOUT_PATH);
    await homePage.waitUntilVisible();
    expect(browser.getPageSource()).not.toContain('Welcome home');
  });
});

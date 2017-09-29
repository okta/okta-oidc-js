const util = require('../util/util');
const constants = require('../util/constants');
const CustomLoginPage = require('../page-objects/CustomLoginPage');
const HomePage = require('../page-objects/HomePage');

browser.waitForAngularEnabled(false);

describe('Custom login page', () => {

  beforeEach(async () => {
    server = util.createDemoServerWithCustomLoginPage();
    await server.start();
  });

  afterEach(async () => await server.stop());

  it('should use the custom login page for authentication', async () => {
    const signInPage = new CustomLoginPage();
    await signInPage.load();
    await browser.sleep(3000);
    await signInPage.waitUntilVisible();

    await signInPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // we should be redirected back to the home page
    const homePage = new HomePage();
    await homePage.waitUntilVisible();
    expect(homePage.getBodyText()).toContain('Welcome home');
  });
});

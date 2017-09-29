const constants = require('../util/constants');
const EC = protractor.ExpectedConditions;

module.exports = class OktaSignInPage {
  constructor() {
    this.username = $('[name=username]');
    this.password = $('[name=password]');
    this.submit = $('#okta-signin-submit');
    this.banner = $('#banner');
  }

  async load() {
    await browser.get(constants.LOGIN_PATH);
  }

  async waitUntilVisible() {
    await browser.wait(EC.presenceOf(this.banner), 50000);
  }

  async signIn({username, password}) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
    await this.submit.click();
  }
}

const EC = protractor.ExpectedConditions;

module.exports = class OktaSignInPage {
  constructor() {
    this.username = $('[name=username]');
    this.password = $('[name=password]');
    this.submit = $('#okta-signin-submit');
  }

  async waitUntilVisible() {
    await browser.wait(EC.presenceOf(this.submit), 5000);
  }

  async signIn({username, password}) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
    await this.submit.click();
  }
}

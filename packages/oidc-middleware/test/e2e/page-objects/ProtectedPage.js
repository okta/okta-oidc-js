const constants = require('../util/constants');
const EC = protractor.ExpectedConditions;

module.exports = class ProtectedPage {
  constructor() {
    this.body = $('body');
  }

  async load() {
    await browser.get(constants.PROTECTED_PATH);
  }

  async waitUntilVisible() {
    await browser.wait(EC.urlIs(constants.PROTECTED_PATH), 5000);
  }

  async getBodyText() {
    return this.body.getText();
  }
}

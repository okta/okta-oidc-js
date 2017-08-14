const constants = require('../util/constants');
const util = require('../util/util');
const EC = protractor.ExpectedConditions;

module.exports = class HomePage {
  constructor() {
    this.body = $('body');
  }

  async load() {
    await browser.get(constants.BASE_URI);
  }

  async waitUntilVisible() {
    const url = util.ensureTrailingSlash(constants.BASE_URI);
    await browser.wait(EC.urlIs(url), 50000);
  }

  async getBodyText() {
    return this.body.getText();
  }
}

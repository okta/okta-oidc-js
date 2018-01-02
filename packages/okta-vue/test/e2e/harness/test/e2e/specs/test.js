// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  beforeEach: function (browser) {
    this.devServer = browser.globals.devServerURL
  },

  'redirects to Okta for login when trying to access a protected page': function (browser) {
    browser
      .url(this.devServer + '/protected')
      .waitForElementVisible('body', 5000)
      .waitForElementVisible('#okta-signin-username', 1000)
      .waitForElementVisible('#okta-signin-password', 1000)
      .waitForElementVisible('#okta-signin-submit', 1000)
      .setValue('#okta-signin-username', process.env.USERNAME)
      .setValue('#okta-signin-password', process.env.PASSWORD)
      .click('#okta-signin-submit')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#logout-button')
      .assert.containsText('.protected', 'Protected!')
      .click('#logout-button')
      .end()
  },

  'redirects to Okta for login': function (browser) {
    browser
      .url(this.devServer)
      .waitForElementVisible('#app', 5000)
      .click('#login-button')
      .waitForElementVisible('#okta-signin-username', 1000)
      .waitForElementVisible('#okta-signin-password', 1000)
      .waitForElementVisible('#okta-signin-submit', 1000)
      .setValue('#okta-signin-username', process.env.USERNAME)
      .setValue('#okta-signin-password', process.env.PASSWORD)
      .click('#okta-signin-submit')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#logout-button')
      .click('#logout-button')
      .end()
  },

  'allows passing sessionToken to skip Okta login': function (browser) {
    browser
      .url(this.devServer + '/sessionToken')
      .waitForElementVisible('#app', 5000)
      .waitForElementVisible('#username', 1000)
      .waitForElementVisible('#password', 1000)
      .setValue('#username', process.env.USERNAME)
      .setValue('#password', process.env.PASSWORD)
      .click('#submit')
      .waitForElementVisible('#logout-button', 5000)
      .assert.elementPresent('#logout-button')
      .click('#logout-button')
      .end()
  }
}

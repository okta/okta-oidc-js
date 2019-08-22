// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  beforeEach: function (browser) {
    this.devServer = browser.globals.devServerURL
  },

  'redirects to Okta for login when trying to access a protected page': function (browser) {
    // Login flow
    browser
      .url(this.devServer + '/protected')
      .waitForElementVisible('body', 5000)
      .waitForElementVisible('#okta-signin-username', 5000)
      .waitForElementVisible('#okta-signin-password', 5000)
      .waitForElementVisible('#okta-signin-submit', 1000)
      .setValue('#okta-signin-username', process.env.USERNAME)
      .setValue('#okta-signin-password', process.env.PASSWORD)
      .click('#okta-signin-submit')
      .waitForElementVisible('#app', 20000)

    // On the protected page
    browser.expect.element('#logout-button').to.be.present.before(2000)
    browser.expect.element('.protected').text.to.contain('Protected!').before(2000)
    browser.expect.element('.protected .userinfo').text.to.contain('email').before(2000)
    browser.assert.urlContains('/protected')

    /// Sign out
    browser.click('#logout-button')
    browser.expect.element('#login-button').to.be.present.before(2000)
    browser.end()
  },

  'redirects to Okta for login': function (browser) {
    // Login flow
    browser
      .url(this.devServer)
      .waitForElementVisible('#app', 5000)
      .click('#login-button')
      .waitForElementVisible('#okta-signin-username', 5000)
      .waitForElementVisible('#okta-signin-password', 5000)
      .waitForElementVisible('#okta-signin-submit', 1000)
      .setValue('#okta-signin-username', process.env.USERNAME)
      .setValue('#okta-signin-password', process.env.PASSWORD)
      .click('#okta-signin-submit')
      .waitForElementVisible('#app', 20000)

    // Verify we are logged in
    browser.expect.element('#logout-button').to.be.present.before(2000)

    /// Sign out
    browser.click('#logout-button')
    browser.expect.element('#login-button').to.be.present.before(2000)
    browser.end()
  },

  'allows passing sessionToken to skip Okta login': function (browser) {
    // Login flow
    browser
      .url(this.devServer + '/sessionToken')
      .waitForElementVisible('#app', 5000)
      .waitForElementVisible('#username', 1000)
      .waitForElementVisible('#password', 1000)
      .setValue('#username', process.env.USERNAME)
      .setValue('#password', process.env.PASSWORD)
      .click('#submit')
      .waitForElementVisible('#logout-button', 20000)

    // On the protected page
    browser.expect.element('.protected').text.to.contain('Protected!').before(2000)
    browser.expect.element('.protected .userinfo').text.to.contain('email').before(2000)
    browser.assert.urlContains('/protected')

    /// Sign out
    browser.click('#logout-button')
    browser.expect.element('#login-button').to.be.present.before(2000)
    browser.end()
  }
}

import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  waitUntilVisible() {
    const loginExists = ExpectedConditions.presenceOf(this.getLoginButton());
    const logoutExists = ExpectedConditions.presenceOf(this.getLogoutButton());
    browser.wait(ExpectedConditions.or(loginExists, logoutExists), 5000);
  }

  waitUntilLoggedOut() {
    browser.wait(ExpectedConditions.presenceOf(this.getLoginButton()), 5000);
  }

  waitUntilLoggedIn() {
    browser.wait(ExpectedConditions.presenceOf(this.getLogoutButton()), 5000);
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }

  getProtectedButton() {
    return element(by.id('protected-button'));
  }
}

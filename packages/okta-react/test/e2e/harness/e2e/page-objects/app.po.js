import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  waitUntilVisible() {
    const loginExists = ExpectedConditions.presenceOf(this.getLoginButton());
    const logoutExists = ExpectedConditions.presenceOf(this.getLogoutButton());
    browser.wait(ExpectedConditions.or(loginExists, logoutExists), 5000);
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

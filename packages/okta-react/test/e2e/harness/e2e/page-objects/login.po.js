import { browser, element, by, ExpectedConditions } from 'protractor';

export class LoginPage {
  navigateTo() {
    return browser.get('/login');
  }

  waitUntilVisible() {
    browser.wait(ExpectedConditions.presenceOf(this.getLogoutButton()), 5000);
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }
}

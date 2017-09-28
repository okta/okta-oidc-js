import { browser, element, by, ExpectedConditions } from 'protractor';

export class ProtectedPage {

  navigateTo() {
    return browser.get('/protected');
  }

  waitUntilVisible() {
    browser.wait(ExpectedConditions.urlContains('/protected'), 5000);
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }
}

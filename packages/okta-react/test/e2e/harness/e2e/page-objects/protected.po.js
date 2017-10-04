import { browser, element, by, ExpectedConditions } from 'protractor';

export class ProtectedPage {
  navigateTo() {
    return browser.get('/protected');
  }

  waitUntilVisible() {
    browser.wait(ExpectedConditions.presenceOf(this.getHeader()), 5000);
  }
  
  getHeader() {
    return element(by.tagName('h3'));
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }
}

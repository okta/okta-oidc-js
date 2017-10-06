import { browser, by, element, ExpectedConditions } from 'protractor';

export class SessionTokenSignInPage {
  navigateTo() {
    return browser.get('/sessionToken-login');
  }

  waitUntilVisible() {
    browser.wait(ExpectedConditions.presenceOf(this.getSubmitButton()), 5000);
  }

  getUsernameField() {
    return element(by.id('username'));
  }

  getPasswordField() {
    return element(by.id('password'));
  }

  getSubmitButton() {
    return element(by.id('submit'));
  }

  signIn({username, password}) {
    this.getUsernameField().sendKeys(username);
    this.getPasswordField().sendKeys(password);
    this.getSubmitButton().click();
  }
}

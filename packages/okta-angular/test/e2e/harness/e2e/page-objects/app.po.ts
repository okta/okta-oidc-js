import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getHomeButton() {
    return element(by.id('home-button'));
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

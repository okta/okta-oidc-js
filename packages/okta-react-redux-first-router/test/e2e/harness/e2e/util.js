
import {browser, ExpectedConditions} from 'protractor';
var EC = ExpectedConditions;

export class Util {
  static waitElement (elementFinder, timeoutMilliseconds) {
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.presenceOf(elementFinder));
    } else {
      return browser.wait(EC.presenceOf(elementFinder), timeoutMilliseconds);
    }
  }

  static waitElementOr (elementFinderOne, elementFinderTwo, timeoutMilliseconds) {
    const elemOneExists = EC.presenceOf(elementFinderOne);
    const elemTwoExists = EC.presenceOf(elementFinderTwo);
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.or(elemOneExists, elemTwoExists));
    } else {
      return browser.wait(EC.or(elemOneExists, elemTwoExists), timeoutMilliseconds);
    }
  }

  static waitUrlContains(path, timeoutMilliseconds) {
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.urlContains(path));
    } else {
      return browser.wait(EC.urlContains(path), timeoutMilliseconds);
    }
  }
}

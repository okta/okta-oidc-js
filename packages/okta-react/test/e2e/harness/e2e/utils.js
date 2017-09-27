import { browser, protractor } from 'protractor';

export class Utils {

  slowDown(milliseconds) {
    const origFn = browser.driver.controlFlow().execute;

    // Typescript does not allow 'arguments'
    // See: https://github.com/Microsoft/TypeScript/issues/1609#issuecomment-71885490
    browser.driver.controlFlow().execute = function() {
      origFn.call(browser.driver.controlFlow(), function() {
        return protractor.promise.delayed(milliseconds);
      });

      return origFn.apply(browser.driver.controlFlow(), arguments);
    };
  }
}

import { browser, by, element } from 'protractor';

browser.waitForAngularEnabled(false);
export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('h1')).getText();
  }
}

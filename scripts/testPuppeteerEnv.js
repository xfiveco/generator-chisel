const PuppeteerEnvironment = require('jest-environment-puppeteer');

module.exports = class PuppeteerCustomEnvironment extends PuppeteerEnvironment {
  setup() {
    try {
      require('puppeteer');
      return super.setup();
    } catch (e) {
      //
    }

    return undefined;
  }

  teardown() {
    console.log('teardown');
    if (!this.global.puppeteerConfig) return undefined;

    return super.teardown();
  }
};

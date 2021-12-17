module.exports = (jestConfig) => {
  try {
    require('puppeteer');
    return require('jest-environment-puppeteer/teardown')(jestConfig);
  } catch (e) {
    //
  }

  return undefined;
};

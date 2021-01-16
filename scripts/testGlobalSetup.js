module.exports = (jestConfig) => {
  try {
    require('puppeteer');
    return require('jest-environment-puppeteer/setup')(jestConfig);
  } catch (e) {
    //
  }

  return undefined;
};

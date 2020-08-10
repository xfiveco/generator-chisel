/**
 * @jest-environment ./scripts/testPuppeteerEnv
 */
/* global page */

const fs = require('fs-extra');
const { answers } = require('./helpers');

global.chiselTestHelpers.setupPhpServer();

describe.supportsPuppeteer('WP dev', () => {
  test('Starts dev server and reloads on changes', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      answers(),
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    global.phpServer.start(8080, 'wp');

    const stop = await global.chiselTestHelpers.runChiselScript(['dev']);

    await page.goto('http://localhost:3000');
    global.chiselTestHelpers.browserSync.monitor(page);

    await global.chiselTestHelpers.oncePromise(page, 'bsConnected');

    await expect(page).not.toMatchElement('#tease-test-1');

    const file =
      'wp/wp-content/themes/chisel-test-wp-chisel/templates/components/tease.twig';
    fs.writeFileSync(
      file,
      fs.readFileSync(file, 'utf8').replace('id="tease-', 'id="tease-test-'),
    );

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    await expect(page).toMatchElement('#tease-test-1');

    await stop();

    // TODO: assets, js, (s)css, react?
  });
});

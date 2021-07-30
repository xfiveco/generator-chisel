/**
 * @jest-environment ./scripts/testPuppeteerEnv
 */
/* global page */

const fs = require('fs-extra');
const supertest = require('supertest');
const { answers } = require('./helpers');

global.chiselTestHelpers.setupPhpServer();
describe.supportsPuppeteer('WP dev', () => {
  test('Starts dev server and reloads on changes', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      answers({ port: 8081 }),
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    await global.phpServer.start(8080, 'wp');

    const stop = await global.chiselTestHelpers.runChiselScript(['dev']);

    await page.goto('http://localhost:3000');
    global.chiselTestHelpers.browserSync.monitor(page);

    await global.chiselTestHelpers.oncePromise(page, 'bsConnected');

    await expect(page).not.toMatchElement('#tease-test-1');

    // Test reload on twig update

    {
      const file =
        'wp/wp-content/themes/chisel-test-wp-chisel/templates/components/tease.twig';
      fs.writeFileSync(
        file,
        fs.readFileSync(file, 'utf8').replace('id="tease-', 'id="tease-test-'),
      );
    }

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    await expect(page).toMatchElement('#tease-test-1');

    // Test Reload on JS Update

    await page.goto('http://localhost:3000/?p=1');

    await global.chiselTestHelpers.oncePromise(page, 'bsConnected');

    await expect(page).toMatchElement('.js-greeting', { text: /^World$/ });

    fs.writeFileSync(
      './src/scripts/modules/greeting.js',
      fs
        .readFileSync('./src/scripts/modules/greeting.js', 'utf8')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('= name;', '= `Updated ${name} Reloads`;'),
    );

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    await expect(page).toMatchElement('.js-greeting', {
      text: /^Updated World Reloads$/,
    });

    // Test CSS Reload without page reload

    const frameNavigated = jest.fn();

    let cssRequestPromiseResolve;
    const cssRequestPromise = new Promise((resolve) => {
      cssRequestPromiseResolve = resolve;
    });

    const requestListener = async (req) => {
      if (!req.url().includes('styles/main.css')) return;

      const body = (await req.response().buffer()).toString('utf8');
      expect(body).toContain('border-bottom: 1px solid rebeccapurple;');
      cssRequestPromiseResolve();
    };

    page.on('framenavigated', frameNavigated);
    page.on('requestfinished', requestListener);

    fs.writeFileSync(
      './src/styles/components/_header.scss',
      fs
        .readFileSync('./src/styles/components/_header.scss', 'utf8')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('$color-border', 'rebeccapurple'),
    );

    await cssRequestPromise;

    page.off('requestfinished', requestListener);
    page.off('framenavigated', frameNavigated);

    expect(frameNavigated).not.toHaveBeenCalled();

    // Test reload on asset creation and update

    const request = supertest('http://localhost:3000');

    fs.writeFileSync('./src/assets/some-asset.txt', 'Hello Some Asset');

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    const assetsPath = '/wp-content/themes/chisel-test-wp-chisel/dist/assets';
    const assetsUrl =
      'http://localhost:8080/wp-content/themes/chisel-test-wp-chisel/dist/assets';

    await request
      .get(`${assetsPath}/some-asset.6ce8c191.txt`)
      .expect(200)
      .expect('Content-Length', '16');

    {
      const file =
        'wp/wp-content/themes/chisel-test-wp-chisel/templates/components/header.twig';
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, 'utf8')
          .replace('href="/"', `href="{{ assetPath('some-asset.txt') }}"`),
      );
    }

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    await request
      .get('/')
      .expect(
        200,
        new RegExp(`href="${assetsUrl}/some-asset\\.6ce8c191\\.txt"`),
      );

    fs.writeFileSync('./src/assets/some-asset.txt', 'Hello Some Asset Updated');

    await global.chiselTestHelpers.oncePromise(page, 'chiselNavigated');

    await request
      .get(`${assetsPath}/some-asset.5da764e0.txt`)
      .expect(200)
      .expect('Content-Length', '24');

    await request
      .get('/')
      .expect(
        200,
        new RegExp(`href="${assetsUrl}/some-asset\\.5da764e0\\.txt"`),
      );

    await stop();
  });
});

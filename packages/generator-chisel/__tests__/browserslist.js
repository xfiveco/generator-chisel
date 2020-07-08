const path = require('path');
const fs = require('fs-extra');
const chisel = require('../bin/chisel');

const binPath = path.resolve(__dirname, '../bin/chisel.js');

global.chiselTestHelpers.tmpCurrentDirectory();

async function testWithBrowsers(browsers) {
  global.chiselTestHelpers.mockPromptAnswers((data) => [
    null,
    () => ({
      ...data,
      app: {
        name: 'Chisel Test',
        author: 'Jakub Bogucki',
        projectType: 'wp-with-fe',
        browsers,
      },
    }),
    () => ({
      ...data,
      wp: {
        title: 'Chisel Test',
        url: 'http://chisel-test.test/',
        adminUser: 'admin',
        adminPassword: 'a',
        adminEmail: 'jakub.bogucki+chisel-test@xfive.co',
      },
    }),
    () => ({ ...data, wpPlugins: { plugins: [] } }),
  ]);

  await chisel([
    process.argv[0],
    binPath,
    'create',
    '--skip-dependencies-install',
    '--skip-wp-download',
    '--skip-wp-config',
    '--skip-wp-install',
    '--skip-wp-plugins',
    '--skip-wp-commands',
    '--skip-format-and-build',
  ]);

  expect(
    fs.readFileSync('./.browserslistrc', { encoding: 'utf8' }),
  ).toMatchSnapshot();
}

describe('.browserslist generation', () => {
  test('should generate empty', async () => {
    await testWithBrowsers([]);
  });

  test('should generate modern only', async () => {
    await testWithBrowsers(['modern']);
  });

  test('should generate modern & edge', async () => {
    await testWithBrowsers(['modern', 'edge18']);
  });

  test('should generate all', async () => {
    await testWithBrowsers(['modern', 'edge18', 'ie11']);
  });
});

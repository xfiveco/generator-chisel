const fs = require('fs-extra');

async function testWithBrowsers(browsers) {
  await global.chiselTestHelpers.generateProjectWithAnswers(
    [
      'create',
      '--skip-dependencies-install',
      '--skip-wp-download',
      '--skip-wp-config',
      '--skip-wp-install',
      '--skip-wp-plugins',
      '--skip-wp-commands',
      '--skip-format-and-build',
    ],
    [
      null,
      {
        app: {
          name: 'Chisel Test',
          author: 'Jakub Bogucki',
          projectType: 'wp-with-fe',
          browsers,
        },
      },
      {
        wp: {
          title: 'Chisel Test',
          url: 'http://chisel-test.test/',
          adminUser: 'admin',
          adminPassword: 'a',
          adminEmail: 'jakub.bogucki+chisel-test@xfive.co',
        },
      },
      { wpPlugins: { plugins: [] } },
    ],
  );

  expect(fs.readFileSync('./.browserslistrc', 'utf8')).toMatchSnapshot();
}

describe('Generator: .browserslist generation', () => {
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

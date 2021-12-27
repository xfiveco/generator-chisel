const globby = require('globby');

const defaultAnswers = [
  null,
  {
    app: {
      name: 'Chisel Test WP',
      author: 'Xfive Tester',
      projectType: 'wp-with-fe',
      browsers: ['modern'],
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
  {
    databaseHost: '127.0.0.1',
    databasePort: '3306',
    databaseName: `chisel-test-wp-dbrand${Date.now()}`,
    databaseUser: 'root',
    databasePassword: '',
  },
];

describe('Generator WordPress', () => {
  test('Generates all expected files', async () => {
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
      defaultAnswers,
    );

    const files = (await globby('./', { dot: true })).sort();

    expect(files).toMatchSnapshot();
  });

  test('Generates all expected files and downloads WP', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      [
        'create',
        '--skip-wp-config',
        '--skip-wp-install',
        '--skip-wp-plugins',
        '--skip-wp-commands',
        '--skip-format-and-build',
      ],
      defaultAnswers,
    );

    await global.chiselTestHelpers.expectFilesToMatchSnapshot(
      ['./', '!node_modules', '!yarn.lock'],
      ['wp/wp-admin/', 'wp/wp-includes/'],
    );
  });

  test.only('Generates all expected files, downloads, configures and installs WP', async () => {
    await jest.resetModules();
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      defaultAnswers,
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    await global.chiselTestHelpers.expectFilesToMatchSnapshot(
      ['./', '!node_modules', '!yarn.lock'],
      ['wp/wp-admin/', 'wp/wp-includes/', 'wp/wp-content/plugins/'],
    );

    await global.chiselTestHelpers.fileMatchesSnapshot('./dev-vhost.conf');
    await global.chiselTestHelpers.fileMatchesSnapshot(
      './wp/wp-config-local.php',
    );
  });
});

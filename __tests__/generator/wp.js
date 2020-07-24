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

    const files = await globby(['./', '!node_modules'], { dot: true });

    const wpAdminCount = files.filter((file) => file.startsWith('wp/wp-admin/'))
      .length;
    const wpIncludesCount = files.filter((file) =>
      file.startsWith('wp/wp-includes/'),
    ).length;
    const wpPluginsCount = files.filter((file) =>
      file.startsWith('wp/wp-content/plugins/'),
    ).length;

    const count = (n) => (n > 100 ? '100+ files' : n);

    const filesFiltered = [
      ...files.filter(
        (file) =>
          !(
            file.startsWith('wp/wp-admin/') ||
            file.startsWith('wp/wp-includes/') ||
            file.startsWith('wp/wp-content/plugins/') ||
            file === 'yarn.lock'
          ),
      ),
      `wp/wp-admin/${count(wpAdminCount)}`,
      `wp/wp-includes/${count(wpIncludesCount)}`,
      `wp/wp-content/plugins/${count(wpPluginsCount)}`,
    ].sort();

    // console.log(files);

    expect(filesFiltered).toMatchSnapshot();
  });
});

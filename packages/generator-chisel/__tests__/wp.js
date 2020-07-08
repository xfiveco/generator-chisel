const globby = require('globby');
const path = require('path');
const chisel = require('../bin/chisel');

const binPath = path.resolve(__dirname, '../bin/chisel.js');

global.chiselTestHelpers.tmpCurrentDirectory();

const defaultAnswers = (name) => (data) => [
  null,
  () => ({
    ...data,
    app: {
      name,
      author: 'Xfive Tester',
      projectType: 'wp-with-fe',
      browsers: ['modern', 'edge'],
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
];

describe('WordPress', () => {
  test('Generates all expected files', async () => {
    global.chiselTestHelpers.mockPromptAnswers(
      defaultAnswers('Chisel Test Basic'),
    );

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

    const files = (await globby('./', { dot: true })).sort();

    expect(files).toMatchSnapshot();
  });

  test('Generates all expected files and downloads WP', async () => {
    global.chiselTestHelpers.mockPromptAnswers(
      defaultAnswers('Chisel Test WP'),
    );

    await chisel([
      process.argv[0],
      binPath,
      'create',
      '--skip-wp-config',
      '--skip-wp-install',
      '--skip-wp-plugins',
      '--skip-wp-commands',
      '--skip-format-and-build',
    ]);

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

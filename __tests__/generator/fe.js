const globby = require('globby');
const fs = require('fs-extra');
const prettier = require('prettier');

const defaultAnswers = (additionalFeatures = []) => [
  null,
  {
    app: {
      name: 'FrontEnd',
      author: 'Xfive Tester',
      projectType: 'fe',
      browsers: ['modern'],
    },
  },
  {
    fe: {
      additionalFeatures,
    },
  },
];

const CONFIG_VERSION_REGEX = /(?<=chiselVersion: ['"])\d+\.\d+\.\d+(?:-[\w.-]+)?(?=['"])/g;

describe('Generator Static', () => {
  test('Generates all expected files and config', async () => {
    global.chiselTestHelpers.mockPromptAnswers(defaultAnswers());

    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-dependencies-install', '--skip-format-and-build'],
      defaultAnswers(),
    );

    const files = (await globby('./', { dot: true })).sort();

    expect(files).toMatchSnapshot();
    expect(
      prettier
        .format(fs.readFileSync('./chisel.config.js', 'utf8'), {
          parser: 'babel',
        })
        .replace(CONFIG_VERSION_REGEX, '--VERSION--'),
    ).toMatchSnapshot();
  });

  test('Generates all expected files and config with serveDist', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      [
        'create',
        '--skip-dependencies-install',
        '--skip-fe-add-index',
        '--skip-format-and-build',
      ],
      defaultAnswers(['serveDist']),
    );

    const files = (await globby('./', { dot: true })).sort();

    expect(files).toMatchSnapshot();
    expect(
      prettier
        .format(fs.readFileSync('./chisel.config.js', 'utf8'), {
          parser: 'babel',
        })
        .replace(CONFIG_VERSION_REGEX, '--VERSION--'),
    ).toMatchSnapshot();
  });

  test('Generates all expected files and config with skipHtmlExtension', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-dependencies-install', '--skip-format-and-build'],
      defaultAnswers(['skipHtmlExtension']),
    );

    const files = (await globby('./', { dot: true })).sort();

    expect(files).toMatchSnapshot();
    expect(
      prettier
        .format(fs.readFileSync('./chisel.config.js', 'utf8'), {
          parser: 'babel',
        })
        .replace(CONFIG_VERSION_REGEX, '--VERSION--'),
    ).toMatchSnapshot();
  });

  test('Generate and build FE Project', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      defaultAnswers(),
    );

    // bug: hash of the css is depends on path of
    const files = (
      await globby(['./', '!node_modules', '!yarn.lock'], { dot: true })
    )
      .sort()
      .map((val) =>
        val
          .replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/, '--HASH--')
          .replace(/(?<=scripts\/app\.)[a-z0-9]+(?=\.)/g, '--HASH--')
        ,
      );

    expect(files).toMatchSnapshot();
    expect(
      fs
        .readFileSync('./chisel.config.js', 'utf8')
        .replace(CONFIG_VERSION_REGEX, '--VERSION--'),
    ).toMatchSnapshot();
  });
});

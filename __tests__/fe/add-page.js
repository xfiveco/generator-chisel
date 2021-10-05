const fs = require('fs-extra');
const { defaultAnswers, somePageSimple } = require('./helpers');

const indexAndFilesMatchesSnapshot = async () => {
  global.chiselTestHelpers.fileMatchesSnapshot('./index.html');

  await global.chiselTestHelpers.expectFilesToMatchSnapshot([
    './content',
    './src/templates',
    './dist',
  ]);
};

describe('FE add-page', () => {
  test('Adds pages in default setup', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    global.chiselTestHelpers.fileMatchesSnapshot('./index.html');

    const consoleMock = jest.spyOn(console, 'log');

    await global.chiselTestHelpers.runChiselScript(['add-page', 'Page 1']);

    await indexAndFilesMatchesSnapshot();
    global.chiselTestHelpers.fileMatchesSnapshot('./src/templates/page1.twig');

    await global.chiselTestHelpers.runChiselScript([
      'add-page',
      'Some Other Page',
      'Second Page',
      'Third Page',
    ]);

    await indexAndFilesMatchesSnapshot();

    global.chiselTestHelpers.normalizeConsoleMockCalls(consoleMock);
    expect(consoleMock.mock.calls).toMatchSnapshot();
  });

  test('Adds pages with the same name', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    await global.chiselTestHelpers.runChiselScript(['add-page', 'Page 1']);

    await global.chiselTestHelpers.runChiselScript(['add-page', 'Page 1']);

    await indexAndFilesMatchesSnapshot();
  });

  test("Doesn't build with --no-build", async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    await global.chiselTestHelpers.runChiselScript([
      'add-page',
      'Page No Build',
      '--no-build',
    ]);

    await indexAndFilesMatchesSnapshot();
  });

  test('Fails when adding nested page in default setup', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    const addPage = global.chiselTestHelpers.runChiselScript([
      'add-page',
      'fine',
      'nested/interesting page',
    ]);

    await expect(addPage).rejects.toThrowErrorMatchingSnapshot();

    await indexAndFilesMatchesSnapshot();
  });

  test('Fails when no page is passed', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((...args) => {
        throw new Error(`Process.exit: ${args.join(', ')}`);
      });

    const consoleMock = jest.spyOn(process.stderr, 'write');

    const addPage = global.chiselTestHelpers.runChiselScript(['add-page']);

    await expect(addPage).rejects.toThrowErrorMatchingSnapshot();

    expect(consoleMock.mock.calls).toMatchSnapshot();
    expect(mockExit.mock.calls).toMatchSnapshot();

    await indexAndFilesMatchesSnapshot();
  });

  test('When using content add pages there and supports nested pages', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./content/hello.twig', somePageSimple);

    await global.chiselTestHelpers.runChiselScript(['add-page', 'Page 1']);

    await indexAndFilesMatchesSnapshot();

    await global.chiselTestHelpers.runChiselScript([
      'add-page',
      'fine',
      'nested/Interesting Page',
      'deeply/nested/Some Other Page',
    ]);

    await indexAndFilesMatchesSnapshot();
  });

  test('When using content and markdown adds pages and builds them', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./content/hello.twig', somePageSimple);
    fs.outputFileSync(
      './src/templates/post.twig',
      `
        {% extends "layouts/base.twig" %}
        {% set pageName = post.title %}
        {% block content %}
          <h1>Hello {{ post.title }}</h1>
          <div>{{ post.content }}</div>
        {% endblock %}
      `,
    );

    await global.chiselTestHelpers.runChiselScript(['add-page', 'Page 1']);

    await indexAndFilesMatchesSnapshot();

    await global.chiselTestHelpers.runChiselScript([
      'add-page',
      'fine',
      'nested/Interesting Page',
      'deeply/nested/Some Other Page',
    ]);

    await indexAndFilesMatchesSnapshot();

    global.chiselTestHelpers.fileMatchesSnapshot('./dist/page1.html');
    global.chiselTestHelpers.fileMatchesSnapshot(
      './dist/deeply/nested/some-other-page.html',
    );
  });
});

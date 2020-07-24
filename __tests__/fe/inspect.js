const defaultAnswers = [
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
      additionalFeatures: [],
    },
  },
];

describe('FE Inspect', () => {
  test.only('Generate and inspect FE Project', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    const consoleMock = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    await global.chiselTestHelpers.runChiselScript(['inspect']);

    if (consoleMock.mock.calls[0] && consoleMock.mock.calls[0][0]) {
      consoleMock.mock.calls[0][0] = consoleMock.mock.calls[0][0]
        .replace(/\\+/g, '/')
        .replace(/'.+generator-chisel/g, '--PROJECTS-PATH--')
        .replace(
          /--PROJECTS-PATH--\/\.jest-projects\/[^/'"]+/g,
          '--PROJECT-PATH--',
        );
    }

    expect(consoleMock.mock.calls).toMatchSnapshot();
  });
});

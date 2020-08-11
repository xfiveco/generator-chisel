const { answers } = require('./helpers');

describe('WP wp command', () => {
  test('Works OK and passes error code on errors', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      answers(),
      { interceptWpConfig: true },
    );

    jest.doMock('execa', () =>
      jest.fn((...args) => {
        if (typeof args[2] === 'object' && args[2].stdio === 'inherit') {
          args[2].stdio = 'pipe';
        }
        const execa = jest.requireActual('execa');
        return execa(...args);
      }),
    );

    jest.spyOn(process, 'exit').mockImplementation((...args) => {
      if (args[0] && args[0] !== 0) {
        throw new Error(`Process.exit: ${args.join(', ')}`);
      }
    });

    const mockArgv = jest
      .spyOn(process.argv, 'slice')
      .mockImplementationOnce(() => ['theme', 'list', '--format=csv']);

    await global.chiselTestHelpers.runChiselScript(['wp']);

    const mockedExeca = require('execa');

    expect(
      await mockedExeca.mock.results[0].value.then((v) => ({
        stdout: v.stdout,
        stderr: v.stderr,
      })),
    ).toMatchSnapshot();

    mockedExeca.mockClear();

    // test not-existing command

    mockArgv.mockImplementationOnce(() => ['not-existing']);

    const run = global.chiselTestHelpers.runChiselScript(['wp']);
    await expect(run).rejects.toThrowErrorMatchingSnapshot();

    expect(
      await mockedExeca.mock.results[0].value.catch((e) => ({
        stdout: e.stdout,
        stderr: e.stderr,
      })),
    ).toMatchSnapshot();
  });
});

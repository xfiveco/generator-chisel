const execa = require('execa');
const { answers: answersGenerator } = require('./helpers');

describe('WP wp-config command', () => {
  test('Test generating with wrong port first', async () => {
    const answers = answersGenerator();
    const answersLast = answers[answers.length - 1];
    answers.push({ ...answersLast });
    answersLast.databasePort = '3307';

    const consoleMock = jest.spyOn(console, 'log');

    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      answers,
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    global.chiselTestHelpers.normalizeConsoleMockCalls(consoleMock);
    expect(consoleMock.mock.calls).toMatchSnapshot();
  });

  test('Test generating with existing database', async () => {
    const answers = answersGenerator();
    const answersLast = answers[answers.length - 1];
    answers.push({ useExisting: false });

    await execa('mysql', [
      '-e',
      `CREATE DATABASE \`${answersLast.databaseName}\``,
      '-u',
      'root',
    ]);

    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      answers,
      { interceptWpConfig: true, mockRandomBytes: true },
    );
  });
});

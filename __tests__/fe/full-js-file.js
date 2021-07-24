const { defaultAnswers } = require('./helpers');

describe('Full file js', () => {
  test('Full file js', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      defaultAnswers,
    );

    await global.chiselTestHelpers.fileMatchesSnapshot('./dist/scripts/app.f4d6aaa9.full.js');
  });
});

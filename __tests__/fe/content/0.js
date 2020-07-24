const fs = require('fs-extra');

const { defaultAnswers, md, postPageSimple } = require('./helpers');

describe('FE Content', () => {
  test('Simple', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./content/hello.md', md('Hello', 'Some Content'));
    fs.outputFileSync('./src/templates/post.twig', postPageSimple());

    await global.chiselTestHelpers.runChiselScript(['build']);

    await global.chiselTestHelpers.expectFilesToMatchSnapshot(['./dist']);
    await global.chiselTestHelpers.fileMatchesSnapshot('./dist/hello.html');
  });
});

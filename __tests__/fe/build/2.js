const fs = require('fs-extra');

const {
  defaultAnswers,
  pageMatchesSnapshot,
  somePageSimple,
} = require('./helpers.js');

describe('FE Build', () => {
  test("Generate and build FE Project and don't format", async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./src/templates/some-page.twig', somePageSimple);

    await fs.writeFile(
      './chisel.config.js',
      (await fs.readFile('./chisel.config.js', 'utf8')).replace(
        'staticFrontend: {',
        "staticFrontend: { buildFormat: 'as-is',",
      ),
    );

    await global.chiselTestHelpers.runChiselScript(['build']);

    pageMatchesSnapshot();
  });
});

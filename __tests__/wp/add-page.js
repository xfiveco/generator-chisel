const fs = require('fs');
const { answers } = require('./helpers');

describe('WP add-page', () => {
  test('Add pages', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      answers({ port: 8081 }),
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    const consoleMock = jest.spyOn(console, 'log');

    await global.chiselTestHelpers.runChiselScript([
      'add-page',
      'Page 1',
      'Fancy ąęśćłó/Nested/Name',
    ]);

    global.chiselTestHelpers.normalizeConsoleMockCalls(consoleMock);
    expect(consoleMock.mock.calls).toMatchSnapshot();

    const templates = './wp/wp-content/themes/chisel-test-wp-chisel/templates';
    await global.chiselTestHelpers.expectFilesToMatchSnapshot([
      `${templates}/page-*.twig`,
    ]);

    expect(fs.readFileSync(`${templates}/page-page-1.twig`, 'utf8')).toContain(
      `{% set pageName = 'Page 1' %}`,
    );
    expect(
      fs.readFileSync(
        `${templates}/page-fancy-aesclo-nested-name.twig`,
        'utf8',
      ),
    ).toContain(`{% set pageName = 'Fancy ąęśćłó/Nested/Name' %}`);
  });
});

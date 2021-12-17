const fs = require('fs-extra');
const { defaultAnswers, md, json, postPageSimple } = require('./helpers');

describe('FE Content', () => {
  test('Nested pages, alt templates, extra data', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./content/nested/page.md', md('Hello Page'));
    fs.outputFileSync(
      './content/nested/more-nested/page.md',
      md('Hello More', '', 'date: 2020-04-27T12:30:12Z\nauthor: Jakub'),
    );
    fs.outputFileSync(
      './content/nested/more-nested/with-template.md',
      md(
        'Hello Alt',
        'This author writes things',
        'template: alternative\ndate: 2020-04-27T22:00:00Z\nauthor: Lubos',
      ),
    );
    fs.outputFileSync('./content/json-page.json', json({}));

    fs.outputFileSync(
      './content/nested/json-page.json',
      json({ template: 'alternative', title: 'JSON Title', author: 'Jason' }),
    );

    fs.outputFileSync(
      './src/templates/post.twig',
      postPageSimple(
        `
          {% if post.data.date %}
            Written on {{ post.data.date.toISOString() }}
            by {{ post.data.author }}
            in {{ post.data.category }}.
          {% endif %}
        `,
      ),
    );
    fs.outputFileSync(
      './src/templates/alternative.twig',
      postPageSimple(
        'Alternative template with post by {{ post.data.author }}',
      ),
    );

    await global.chiselTestHelpers.runChiselScript(['build']);

    await global.chiselTestHelpers.expectFilesToMatchSnapshot(['./dist']);
    await global.chiselTestHelpers.fileMatchesSnapshot(
      './dist/nested/page.html',
    );
    await global.chiselTestHelpers.fileMatchesSnapshot(
      './dist/nested/more-nested/page.html',
    );
    await global.chiselTestHelpers.fileMatchesSnapshot(
      './dist/nested/more-nested/with-template.html',
    );
    await global.chiselTestHelpers.fileMatchesSnapshot('./dist/json-page.html');
    await global.chiselTestHelpers.fileMatchesSnapshot(
      './dist/nested/json-page.html',
    );
  });
});

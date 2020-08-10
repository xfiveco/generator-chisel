const fs = require('fs-extra');
const { defaultAnswers, md, json } = require('./helpers');

describe('FE Content', () => {
  test('Twig functions work', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create', '--skip-format-and-build'],
      defaultAnswers,
    );

    fs.outputFileSync('./content/nested.md', md('Nested Top Level'));
    fs.outputFileSync('./content/nested/page.md', md('Nested Page'));
    fs.outputFileSync(
      './content/really/no-parent-nested/page.md',
      md('Nested Page No Parent'),
    );
    fs.outputFileSync('./content/top-page.md', md('Top Page'));
    fs.outputFileSync('./content/json-page.json', json({ title: 'JSON Page' }));
    fs.outputFileSync('./src/assets/hello.txt', 'Hello World');
    fs.outputFileSync('./src/assets/deeply/nested/file.txt', 'DNF');

    fs.outputFileSync(
      './content/class-name.twig',
      `
        <ul>
          <li>{{ className({}) }}</li>
          <li>{{ className('') }}</li>
          <li>{{ className('c-hello') }}</li>
          <li>{{ className('c-hello', 'world', '', false, null, 'something', none, (isDev() ? 'dev' : 'prod')) }}</li>
        </ul>
      `,
    );

    fs.outputFileSync(
      './content/get-posts.twig',
      /* HTML */ `
        {% set posts = getPosts({ parent: { '$exists': false } }) %}
        <ul>
          {% for p in posts %}
          <li>
            {{ p.id }} - {{ p.children | length }} <br />
            ({{ p.prev.id}} - {{ p.next.id }})
          </li>
          {% endfor %}
        </ul>
      `,
    );

    fs.outputFileSync(
      './src/templates/post.twig',
      /* HTML */ `
        <!DOCTYPE html>
        <html data-webpack-public-path="{{ getDistPath() }}">
          <head>
            <title>
              {{ post.ID }} - {{ post.type }} - {{ post.parent.id ?: 'no p' }}
            </title>
            <link
              rel="stylesheet"
              property="stylesheet"
              href="{{ revisionedPath('styles/main.css') }}"
              type="text/css"
            />
            <script src="{{ revisionedPath('scripts/app.js') }}" defer></script>
          </head>
          <body>
            <div>
              Here is <a href="{{ assetPath('hello.txt') }}">Text File</a> and
              <a href="{{ assetPath('deeply/nested/file.txt')}}">DNF</a>.
            </div>
            {% set np = getPosts({ id: 'nested/page' })[0] %}
            <div>
              Links:
              <ul>
                <li>Absolute <a href="{{ np.link }}">{{ np.title }}</a></li>
                <li>
                  Relative 1 <a href="{{ np.link(post) }}">{{ np.title }}</a>
                </li>
                <li>
                  Relative 2 <a href="{{ postLink(np) }}">{{ np.title }}</a>
                </li>
              </ul>
            </div>
          </body>
        </html>
      `,
    );

    await global.chiselTestHelpers.runChiselScript(['build']);

    const files = [
      'class-name',
      'get-posts',
      'top-page',
      'json-page',
      'nested/page',
      'really/no-parent-nested/page',
    ];

    for (const file of files) {
      await global.chiselTestHelpers.fileMatchesSnapshot(`./dist/${file}.html`);
    }
  });
});

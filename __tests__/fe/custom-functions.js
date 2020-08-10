const fs = require('fs-extra');
const { defaultAnswers } = require('./helpers');

describe('FE Custom Functions', () => {
  test('Custom functions work ', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      defaultAnswers,
    );

    fs.outputFileSync(
      './src/templates/page-1.twig',
      /* HTML */ `
        <!DOCTYPE html>
        <ul>
          <li>{{ simple() }}</li>
          <li>{{ add(10, 20) }}</li>
          <li>{{ somethingAsync() }}</li>
        </ul>
      `,
    );

    fs.outputFileSync(
      './chisel.config.js',
      fs.readFileSync('./chisel.config.js', 'utf8').replace(
        /};\n$/,
        `
          staticFrontend: {
            functions: {
              simple({ functions: { revisionedPath } }) {
                return revisionedPath('scripts/app.js');
              },

              add(_, a, b) {
                return 'ADD: ' + (a + b);
              },

              async somethingAsync() {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 'After timeout';
              },
            },
          },

          };\n`,
      ),
    );

    await global.chiselTestHelpers.runChiselScript(['build']);

    global.chiselTestHelpers.fileMatchesSnapshot('./dist/page-1.html');
  });
});

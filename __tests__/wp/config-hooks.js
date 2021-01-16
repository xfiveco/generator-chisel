const fs = require('fs-extra');
const path = require('path');
const supertest = require('supertest');
const nodeEval = require('node-eval');
const { answers } = require('./helpers');

global.chiselTestHelpers.setupPhpServer();

describe('WP config hooks', () => {
  test('Starts dev server on different port', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      answers({ port: 8082 }),
      { interceptWpConfig: true, mockRandomBytes: true },
    );

    fs.outputFileSync(
      './chisel.config.js',
      fs.readFileSync('./chisel.config.js', 'utf8').replace(
        /(?=};\n$)/,
        `
          hooks: {
            wordPress: {
              browserSyncConfig(config) {
                config.port = 3100;
              }
            }
          },
        `,
      ),
    );

    await global.phpServer.start(8082, 'wp');

    jest.resetModules();

    // reset modules seems to not actually reset modules
    const configPath = path.resolve('./chisel.config.js');
    jest.doMock(configPath, () => {
      return nodeEval(fs.readFileSync(configPath, 'utf8'), configPath);
    });
    const stop = await global.chiselTestHelpers.runChiselScript(['dev']);

    await supertest('http://localhost:3100').get('/').expect(200);

    await stop();
  });
});

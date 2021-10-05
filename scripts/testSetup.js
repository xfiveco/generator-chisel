/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');
const { merge } = require('lodash');
const globby = require('globby');
const Module = require('module');

process.env.CHISEL_TEST = true;
// process.env.CHISEL_ROOT = path.join(__dirname, '..');
process.env.CHISEL_TEST_NODE_MODULES = path.join(
  __dirname,
  '../.jest-projects/deps/node_modules',
);

fs.mkdirpSync(process.env.CHISEL_TEST_NODE_MODULES);

global.chiselTestHelpers = {
  mockPromptAnswers(answersGenerator) {
    const inquirer = require('inquirer');

    let question = 0;
    const original = inquirer.prompt;
    inquirer.prompt = jest.fn(async (questions, data) => {
      question += 1;

      const answers = answersGenerator(data);

      return answers[question] ? answers[question]() : undefined;
    });

    return () => {
      inquirer.prompt = original;
    };
  },

  async generateProjectWithAnswers(
    params,
    answers,
    { interceptWpConfig = false, mockRandomBytes = false } = {},
  ) {
    const binPath = path.resolve(
      __dirname,
      '../packages/generator-chisel/bin/chisel',
    );

    let unMockAnswers;
    if (answers) {
      unMockAnswers = global.chiselTestHelpers.mockPromptAnswers((data) =>
        answers.map((ans) => () => merge({}, data, ans)),
      );
    }

    let unMockRun;
    if (interceptWpConfig) {
      const sharedUtils = require('chisel-shared-utils');
      const original = sharedUtils.run;

      const { isEqual } = require('lodash');
      sharedUtils.runLocal = jest.fn((...args) => {
        if (isEqual(args[0], ['chisel-scripts', 'wp-config'])) {
          return global.chiselTestHelpers.runChiselScript(['wp-config']);
        }

        return original(...args);
      });

      unMockRun = () => {
        sharedUtils.runLocal = original;
      };
    }

    let unMockRandomBytes;
    if (mockRandomBytes) {
      const crypto = require('crypto');
      const original = crypto.randomBytes;

      let randomCallNumber = 0;

      crypto.randomBytes = jest.fn((bytes) => {
        randomCallNumber += 1;
        const { MersenneTwister19937 } = require('random-js');
        const mt = MersenneTwister19937.seedWithArray([
          20200807,
          randomCallNumber,
        ]);

        return Buffer.from([...Array(bytes)].map(() => mt.next() % 256));
      });

      unMockRandomBytes = () => {
        crypto.randomBytes = original;
      };
    }

    const chisel = require('../packages/generator-chisel/bin/chisel');
    await chisel([process.argv[0], binPath, ...params]);

    if (unMockAnswers) unMockAnswers();
    if (unMockRun) unMockRun();
    if (unMockRandomBytes) unMockRandomBytes();
  },

  async runChiselScript(args) {
    const generator = path.dirname(__dirname);
    const paths = Module._nodeModulePaths(process.cwd()).filter((p) =>
      p.startsWith(generator),
    );

    for (const p of paths) {
      const fibers = path.join(p, 'fibers');
      if (await fs.exists(fibers)) {
        await fs.remove(fibers);
      }
    }

    return require('chisel-scripts/bin/chisel-scripts')(args);
  },

  async expectFilesToMatchSnapshot(
    filesPaths = ['./', '!node_modules', '!yarn.lock'],
    groupsPrefixes = [],
  ) {
    // bug: hash of the css is depends on path of
    let files = (await globby(filesPaths, { dot: true }))
      .sort()
      .map((val) =>
        val
          .replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/, '--HASH--')
          .replace(/(?<=scripts\/app\.)[a-z0-9]+(?=\.)/g, '--HASH--'),
      );

    const groupsPrefixesCounts = groupsPrefixes.map(
      (prefix) => files.filter((file) => file.startsWith(prefix)).length,
    );

    files = files.filter(
      (file) => !groupsPrefixes.some((prefix) => file.startsWith(prefix)),
    );

    groupsPrefixes.forEach((prefix, index) => {
      const count = groupsPrefixesCounts[index];
      if (count === 0) return;

      const countStr = count > 100 ? '100+ files' : count;

      files.push(`${prefix}${countStr}`);
    });

    files = files.sort();

    expect(files).toMatchSnapshot();
  },

  normalizeConsoleMockCalls(consoleMock) {
    consoleMock.mock.calls.forEach((call) => {
      if (typeof call[0] === 'string') {
        call[0] = call[0]
          .replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/g, '--HASH--')
          .replace(/(?<=scripts\/app\.)[a-z0-9]+(?=\.)/g, '--HASH--')
          .split(process.cwd())
          .join('--PROJECT-PATH--')
          .replace(/\\+/g, '/')
          .replace(
            /(?<=Can't connect to MySQL server on '[\d.]+' \()[^\)]+(?=\))/g,
            '--ERROR-DETAILS-',
          );
      }
    });

    if (consoleMock.mock.calls[1] && consoleMock.mock.calls[1][0]) {
      // in Ci in Node 12 and 14 there is difference in gzip compression
      // ex. https://travis-ci.com/github/jakub300/generator-chisel/builds/231019589
      const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
      const call = consoleMock.mock.calls[1][0];
      if (nodeVersion === 10) {
        consoleMock.mock.calls[1][0] = call.replace('4.86 KiB', '4.85 KiB');
      } else if (nodeVersion === 12) {
        consoleMock.mock.calls[1][0] = call.replace('1.87 KiB', '1.88 KiB');
      }
    }
  },

  fileMatchesSnapshot(file) {
    expect(
      fs
        .readFileSync(file, 'utf8')
        .replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/g, '--HASH--')
        .replace(/(?<=scripts\/app\.)[a-z0-9]+(?=\.)/g, '--HASH--')
        .replace(/dbrand\d+/g, '--DB-RAND--')
        .split(process.cwd())
        .join('--PROJECT-PATH--')
        .replace(/(?<=--PROJECT-PATH--)\\/g, '/')
        .replace(/Copyright &copy; 202\d /g, 'Copyright &copy; 2020 '),
    ).toMatchSnapshot();
  },

  setupPhpServer() {
    const execa = require('execa');

    global.phpServer = {
      async start(port = 8080, dir = '.') {
        if (global.phpServerProcess) {
          await global.phpServer.stop();
        }

        global.phpServerProcess = execa(
          'php',
          ['-S', `127.0.0.1:${port}`, '-t', dir],
          { stdio: 'inherit' },
        );
      },

      async stop() {
        const proc = global.phpServerProcess;
        if (proc) {
          global.phpServerProcess = undefined;
          proc.kill('SIGTERM', {
            forceKillAfterTimeout: 2000,
          });

          return proc.catch(() => {});
        }

        throw new Error('Process is already stopped');
      },
    };

    afterEach(async () => {
      if (global.phpServerProcess) {
        // global.phpServerProcess.
        await global.phpServer.stop();
        global.phpServerProcess = undefined;
      }
    });
  },

  browserSync: {
    monitor(page) {
      let previousMessage = '';
      let isWaitingForClose = false;
      let stopWaiting = false;

      function wait() {
        page
          .waitForSelector('#__bs_notify__')
          .finally(() => {
            if (stopWaiting) return;
            wait();
          })
          .then(() => {
            if (!isWaitingForClose) {
              isWaitingForClose = true;
              page
                .waitForSelector('#__bs_notify__', { hidden: true })
                .then(() => {
                  previousMessage = '';
                  isWaitingForClose = false;
                })
                .catch(() => {});
            }
            return page.$('#__bs_notify__');
          })
          .then((el) => el.getProperty('textContent'))
          .then((val) => val.jsonValue())
          .then((str) => {
            if (previousMessage === str) {
              return;
            }
            console.log({ bsMessgae: str });
            previousMessage = str;
            process.nextTick(() => page.emit('bsNotify', str));
            if (str === 'Browsersync: connected') {
              process.nextTick(() => page.emit('bsConnected'));
            }
          })
          .catch(() => {});
      }
      wait();

      page.on('framenavigated', () => {
        console.log('chiselNavigated');
        process.nextTick(() => page.emit('chiselNavigated'));
      });

      page.on('close', () => {
        stopWaiting = true;
      });
    },
  },

  oncePromise(resource, ev) {
    return new Promise((resolve) => {
      resource.once(ev, (...args) => {
        if (args.length === 0) {
          resolve();
        } else if (args.length === 1) {
          resolve(args[0]);
        } else {
          resolve(args);
        }
      });
    });
  },
};

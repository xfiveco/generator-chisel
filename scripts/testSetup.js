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

  async generateProjectWithAnswers(params, answers) {
    const chisel = require('../packages/generator-chisel/bin/chisel');
    const binPath = path.resolve(
      __dirname,
      '../packages/generator-chisel/bin/chisel',
    );

    let unmockAnswers;
    if (answers) {
      unmockAnswers = global.chiselTestHelpers.mockPromptAnswers((data) =>
        answers.map((ans) => () => merge({}, data, ans)),
      );
    }

    await chisel([process.argv[0], binPath, ...params]);

    if (unmockAnswers) {
      unmockAnswers();
    }
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

    await require('chisel-scripts/bin/chisel-scripts')(args);
  },

  async expectFilesToMatchSnapshot(
    filesPaths = ['./', '!node_modules', '!yarn.lock'],
  ) {
    // bug: hash of the css is depends on path of
    const files = (await globby(filesPaths, { dot: true }))
      .sort()
      .map((val) =>
        val.replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/, '--HASH--'),
      );

    expect(files).toMatchSnapshot();
  },

  fixHashesInConsoleMock(consoleMock) {
    if (consoleMock.mock.calls[1] && consoleMock.mock.calls[1][0]) {
      consoleMock.mock.calls[1][0] = consoleMock.mock.calls[1][0].replace(
        /(?<=styles\/main\.)[a-z0-9]+(?=\.)/g,
        '--HASH--',
      );

      // in Ci in Node 12 there is difference in gzip compression
      // ex. https://travis-ci.org/github/xfiveco/generator-chisel/jobs/712710842
      if (parseInt(process.versions.node.split('.')[0], 10) >= '12') {
        consoleMock.mock.calls[1][0] = consoleMock.mock.calls[1][0].replace(
          '4.78 KiB',
          '4.79 KiB',
        );
      }
    }
  },

  fileMatchesSnapshot(file) {
    expect(
      fs
        .readFileSync(file, 'utf8')
        .replace(/(?<=styles\/main\.)[a-z0-9]+(?=\.)/g, '--HASH--'),
    ).toMatchSnapshot();
  },
};

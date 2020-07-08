/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

process.env.CHISEL_TEST = true;

global.chiselTestHelpers = {
  tmpCurrentDirectory() {
    const initialDir = process.cwd();

    beforeEach(() => {
      const now = new Date().toISOString().replace(/[^\w\d]/g, '');
      const dir = path.resolve(initialDir, '.jest-projects', now);
      fs.mkdirpSync(dir);
      process.chdir(dir);
    });

    afterEach(async () => {
      const currentPwd = process.cwd();
      process.chdir(initialDir);
      if (currentPwd.includes('.jest-projects')) {
        // console.log('REMOVE SYNC');
        // await fs.remove(currentPwd);
        await fs.remove(currentPwd);
      }
    });
  },

  mockPromptAnswers(answersGenerator) {
    const inquirer = require('inquirer');

    let question = 0;
    inquirer.prompt = jest.fn(async (questions, data) => {
      question += 1;

      const answers = answersGenerator(data);

      return answers[question] ? answers[question]() : undefined;
    });
  },
};

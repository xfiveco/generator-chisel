const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const { merge, camelCase } = require('lodash');
const PRIORITIES = require('./priorities');
const sortPackage = require('../../utils/sort-package');

module.exports = class CreatorPluginAPI {
  constructor(id, creator) {
    this.id = id;
    this.creator = creator;
    this.PRIORITIES = PRIORITIES;
  }

  resolve(..._path) {
    return path.resolve(this.creator.context, ..._path.filter(Boolean));
  }

  schedule(...args) {
    return this.creator.schedule(...args);
  }

  async prompt(questions) {
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    const questionsNormalized = questions.map((question) => {
      const questionCopy = { ...question };
      if (questionCopy.name) {
        questionCopy.name = `${camelCase(this.id)}.${questionCopy.name}`;
      }

      return questionCopy;
    });

    const answers = await inquirer.prompt(
      questionsNormalized,
      this.creator.data,
    );

    merge(this.creator.data, answers);

    return this.creator.data[this.id];
  }

  // eslint-disable-next-line class-methods-use-this
  async promptLocal(questions) {
    return inquirer.prompt(questions);
  }

  // @param from is relative to creator directory
  copy(options = {}) {
    const { copy } = require('chisel-shared-utils');

    return copy({
      ...options,
      from: path.resolve(
        __dirname,
        'creators',
        this.id,
        options.from || 'template',
      ),
      to: this.resolve(options.to),
      templateData: {
        ...this.creator.data,
        creatorData: this.creator.data,
      },
    });
  }

  async modifyFile(file, modifier, options = {}) {
    const filePath = this.resolve(file);
    const {
      encoding = 'utf8',
      isJson = path.extname(file) === '.json',
    } = options;

    let fileBody = await fs.readFile(file, { encoding });

    if (isJson) {
      fileBody = JSON.parse(fileBody);
    }

    let modified = await modifier(fileBody);

    if (modified === undefined) {
      modified = fileBody;
    }

    const packageJsonPath = this.resolve('package.json');

    if (filePath === packageJsonPath) {
      modified = sortPackage(modified);
      modified = `${JSON.stringify(modified, null, 2)}\n`;
    } else if (isJson && typeof modified === 'object') {
      modified = JSON.stringify(modified);
    }

    return fs.writeFile(file, modified);
  }
};

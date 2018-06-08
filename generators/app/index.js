'use strict';

const Generator = require('yeoman-generator');
const utils = require('./utils');
const chalk = require('chalk');
const commandExists = require('command-exists').sync;

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  initializing() {
    if (this.config.existed) {
      this.log('A Chisel project already exists in this folder.');
      this.log(
        'If you are trying to setup existing project check out documentation' +
          ' at https://www.getchisel.co/docs/setup/wordpress/'
      );
      this.log(
        'If process of generating project was interrupted and you would like' +
          ' to continue, we recomend cleaning directory and starting again.'
      );
      process.exit(1);
    }
  }

  prompting() {
    const done = this.async();

    // Welcome user
    this.log('');
    this.log(chalk.yellow(' *********************************************') + '\n');
    this.log(chalk.yellow('  Welcome to Chisel') + '\n');
    this.log(chalk.reset('  https://github.com/xfiveco/generator-chisel') + '\n');
    this.log(chalk.yellow(' *********************************************') + '\n');

    this.prompt(utils.prompts.questions).then(function (answers) {
      utils.prompts.setAnswers.apply(this, [answers]);
      done();
    }.bind(this));
  }

  configuring() {
    // Yeoman config file
    utils.generator.config.call(this);

    // Project configuration files
    utils.generator.dotfiles.call(this);

    // Application files
    utils.generator.appfiles.call(this);
  }

  writing() {
    // Project index
    utils.generator.projectInfo.call(this);

    // Template files
    utils.generator.templates.call(this);

    // Stylesheet files
    utils.generator.stylesheets.call(this);

    // JavaScript files
    utils.generator.javascripts.call(this);

    // Gulp modules
    utils.generator.gulpfiles.call(this);
  }

  installWordpress() {
    if(this.prompts.projectType != 'wp-with-fe' ||
        (this.options['skip-install'] && !this.options['run-wp'])) {
      return;
    }
    this.composeWith(require.resolve('../wp'))
  }

  installNpm() {
    const isYarn = commandExists('yarn');
    this.log(chalk.yellow('\nINSTALLATION\n'));
    this.installDependencies({
      yarn: isYarn,
      npm: !isYarn,
      bower: false,
      skipInstall: this.options['skip-install']
    });
  }
}

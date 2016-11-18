'use strict';

var yeoman = require('yeoman-generator');
var utils = require('./utils');
var chalk = require('chalk');

var Chisel = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments);
  },

  prompting: function () {

    var done = this.async();

    this.prompt(utils.prompts.questions).then(function (answers) {
      utils.prompts.setAnswers.apply(this, [answers]);
      done();
    }.bind(this));
  },

  configuring: function () {

    // Yeoman config file
    utils.generator.config.call(this);

    // Project configuration files
    utils.generator.dotfiles.call(this);

    // Application files
    utils.generator.appfiles.call(this);
  },

  writing: function () {

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

    this.log(chalk.yellow('\nFRONT-END SETUP\n'))
  },

  install: {
    installWordpress: function() {
      if(this.prompts.projectType != 'wp-with-fe' || this.options['skip-install'])
        return;
      this.composeWith('chisel:wp');
    },
    installNpm: function() {
      this.log(chalk.yellow('\nINSTALLATION\n'));
      this.installDependencies({
        npm: true,
        bower: false,
        skipInstall: this.options['skip-install']
      });
    }
  }
});

module.exports = Chisel;

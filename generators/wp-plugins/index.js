'use strict';
var Generator = require('yeoman-generator');
var plugins = require('./plugins.json');
var helpers = require('../../helpers');
var wpCli = require('../../helpers/wpCli');
var async = require('async');

module.exports = class extends Generator {

  constructor(args, opts) {
     super(args, opts);
  }

  initializing() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  }

  prompting() {
    var prompts = [
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select optional plugins'
      }
    ];

    var choices = prompts[0].choices = [];

    Object.keys(plugins).forEach((id) => {
      choices.push({
        name: plugins[id],
        value: id
      })
    })

    var done = this.async();
    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      done();
    });
  }

  end() {
    if(!this.prompts.plugins.length)
      return;
    var done = this.async();
    wpCli(['plugin', 'install', {activate: true}].concat(this.prompts.plugins), helpers.throwIfError(done));
  }
}

'use strict';
var Generator = require('yeoman-generator');
var plugins = require('./plugins.json');
var helpers = require('../../helpers');
var wpCli = require('../../helpers/wpCli');
var fs = require('fs');
var async = require('async');

const FIRST_ANSWER_INDEX = 0;
const ACFCLI_URL = 'https://github.com/hoppinger/advanced-custom-fields-wpcli/archive/master.zip';

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

    var choices = prompts[FIRST_ANSWER_INDEX].choices = [];

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
    if(!this.prompts.plugins.length) {
      return;
    }
    var done = this.async();
    async.series([
      (cb) => wpCli(['plugin', 'install', {activate: true}].concat(this.prompts.plugins), cb),
      (cb) => {
        if(this.prompts.plugins.indexOf(ACFCLI_URL) == -1) {
          cb();
          return;
        }
        fs.writeFileSync(
          this.destinationPath('wp/wp-content/plugins/acf-wp-cli-configuration.php'),
          fs.readFileSync(this.templatePath('acf-wp-cli-configuration.php'))
        );
        wpCli(['plugin', 'activate', 'acf-wp-cli-configuration'], cb);
      },
    ], helpers.throwIfError(done))
  }
}

'use strict';
const Generator = require('yeoman-generator');
const helpers = require('../../helpers');
const wpCli = require('../../helpers/wpCli');
const acfCli = require('../../helpers/acfCli');
const async = require('async');

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

  end() {
    var done = this.async();

    async.series([
      (cb) => acfCli.runChecks(this, cb),
      (cb) => wpCli(['acf', 'import', {all: true}], cb),
      (cb) => {
        this.log('🍾  Imported successfully 🍾')
        cb();
      },
    ], helpers.throwIfError(done));
  }
}

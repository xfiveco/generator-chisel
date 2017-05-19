'use strict';
const Generator = require('yeoman-generator');
const helpers = require('../../helpers');
const wpCli = require('../../helpers/wpCli');
const acfCli = require('../../helpers/acfCli');
const async = require('async');
const _ = require('lodash');

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
      (cb) => wpCli(['acf', 'export', {all: true}], cb),
      (cb) => {
        this.log('🍾  Exported successfully 🍾')
        this.log(_.trim(`
          Now we will remove field groups from the database.
          If you would like to edit them again please import them with
          yo chisel:wp-acf-import`.replace(/\s+/g, ' ')))
        cb();
      },
      (cb) => wpCli(['acf', 'clean'], cb),
    ], helpers.throwIfError(done));
  }
}

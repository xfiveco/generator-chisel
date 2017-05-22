'use strict';
var Generator = require('yeoman-generator');
var wpCli = require('../../helpers/wpCli');

const EXIT_CODE_SUCCESS = 0;
const FIRST_NOT_IGNORED_ARGUMENT_INDEX = 3;

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
    // pass arguments except node, yo and generator name
    wpCli(
      process.argv.slice(FIRST_NOT_IGNORED_ARGUMENT_INDEX),
      (code) => process.exit(code || EXIT_CODE_SUCCESS)
    );
  }
}

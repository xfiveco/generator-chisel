'use strict';
var Generator = require('yeoman-generator');
var wpCli = require('../../helpers/wpCli');

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
    wpCli(process.argv.slice(3), (code, stdio) => process.exit(code || 0));
  }
}

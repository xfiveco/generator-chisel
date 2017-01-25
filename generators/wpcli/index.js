'use strict';
var yeoman = require('yeoman-generator');
var wpCli = require('../../helpers/wpCli');

var WpCliGenerator = yeoman.Base.extend({

  initializing: function() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  },

  end: function() {
    var done = this.async();
    wpCli(process.argv.slice(3), (code, stdio) => process.exit(code || 0));
  }

});

module.exports = WpCliGenerator;

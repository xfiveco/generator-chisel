'use strict';
var yeoman = require('yeoman-generator');

var WpConfigGenerator = yeoman.Base.extend({

  initializing: function() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  },

  writing: function() {
    var name = this.configuration.nameSlug;
    this.fs.copyTpl(this.templatePath('dev-vhost.conf'),
      this.destinationPath('dev-vhost.conf'), {
        documentRoot: process.cwd()+'/wp',
        serverName: name + '.dev',
        dbName: name
    });

    this.log(this.fs.read(this.destinationPath('dev-vhost.conf')));
  }

});

module.exports = WpConfigGenerator;

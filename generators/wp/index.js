'use strict';

var yeoman = require('yeoman-generator'),
  fs = require('fs'),
  crypto = require('crypto'),
  helpers = require('../../helpers'),
  async = require('async');

var WpGenerator = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments);
  },

  initializing: function() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
    this.composeWith('chisel:wp-plugins')
  },

  _updateWpConfig: function(cb) {
    async.waterfall([
      (cb) => fs.readFile('wp/wp-config.php', 'utf8', cb),
      (config, cb) => {
        var prefix = this.configuration.nameSlug.replace(/-/g, '_');
        config = config.replace('wp_', prefix + '_');

        config = config.replace(/put your unique phrase here/g,
          () => crypto.randomBytes(30).toString('base64'))

        fs.writeFile('wp/wp-config.php', config, cb);
      }
    ], cb);
  },

  writing: function() {
    this.fs.copy(this.templatePath('composer.json'),
      this.destinationPath('composer.json'));
  },

  install: function() {
    var done = this.async();
    var cb = (err) => {
      if(err)
        throw err;
      done();
    };
    this.spawnCommand('composer', ['install'])
      .on('error', cb)
      .on('exit', cb);
  },

  end: function() {
    var done = this.async();
    var files = {
      'wp-config.php': 'wp/wp-config.php',
      'gitignore': 'wp/.gitignore'
    }
    async.series([
      (cb) => helpers.copyFiles(this.sourceRoot(), files, cb),
      (cb) => this._updateWpConfig(cb),
      (cb) => fs.rename('wp/wp-content/themes/chisel-starter-theme',
        'wp/wp-content/themes/'+this.configuration.nameSlug, cb),
      (cb) => {
        this.spawnCommand('composer', ['--quiet', 'remove', 'xfiveco/chisel-starter-theme'])
          .on('error', cb)
          .on('exit', cb);
      }
    ], (err) => {
      if(err)
        throw err;
      this.log('Installation went well :)')
      done();
    })
  }
});

module.exports = WpGenerator;

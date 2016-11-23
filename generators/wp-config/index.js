'use strict';
var yeoman = require('yeoman-generator'),
  fs = require('fs'),
  helpers = require('../../helpers'),
  async = require('async'),
  mysql = require('mysql');

var WpConfigGenerator = yeoman.Base.extend({

  initializing: function() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  },

  _prompting: function(cb) {
    var prompts = [
      {
        name: 'databaseHost',
        message: 'Enter the database host:',
        default: '127.0.0.1'
      }, {
        name: 'databaseName',
        message: 'Enter the database name:',
        default: this.configuration.nameSlug
      }, {
        name: 'databaseUser',
        message: 'Enter the database user:',
        default: 'root'
      }, {
        type: 'password',
        name: 'databasePassword',
        message: 'Enter the database password:',
      }
    ];

    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      cb();
    });
  },

  prompting: function() {
    var done = this.async();
    async.doDuring(
      (cb) => this._prompting(cb),
      (cb) => {
        // In tests we are passing String object instead of empty string
        // because yeoman-test seems to ignore empty string
        var connection = new mysql.createConnection({
          host: this.prompts.databaseHost,
          user: this.prompts.databaseUser,
          password: this.prompts.databasePassword.toString()
        });
        connection.connect((err) => {
          if(err) {
            console.log('Error when testing database connetion:');
            console.log(err.toString());
          } else {
            connection.destroy();
          }
          cb(null, err);
        })
      },
      helpers.throwIfError(done)
    );
  },

  writing: function() {
    var name = this.configuration.nameSlug;
    this.fs.copyTpl(this.templatePath('dev-vhost.conf'),
      this.destinationPath('dev-vhost.conf'), {
        documentRoot: process.cwd()+'/wp',
        serverName: name + '.dev',
        dbName: name
    });
  },

  /**
   * Wrap setting in quotes if needed.
   */
  _getDbSetting: function (setting) {
    var val = this.prompts[setting];
    if(val.startsWith('$_')) {
      return val;
    }
    // TODO That's not proper escaping
    return '\'' + this.prompts[setting] + '\'';
  },

  _updateWpConfig: function(cb) {
    async.waterfall([
      (cb) => fs.readFile('wp/wp-config-local.php', 'utf8', cb),
      (config, cb) => {
        var prefix = this.configuration.nameSlug.replace(/-/g, '_');
        config = config
          .replace('\'localhost\'', this._getDbSetting('databaseHost'))
          .replace('\'database_name_here\'', this._getDbSetting('databaseName'))
          .replace('\'username_here\'', this._getDbSetting('databaseUser'))
          .replace('\'password_here\'', this._getDbSetting('databasePassword'))
          .replace('wp_', prefix + '_');

        fs.writeFile('wp/wp-config-local.php', config, cb);
      }
    ], cb);
  },

  install: function() {
    var done = this.async();
    var files = {
      'wp-config-local.php': 'wp/wp-config-local.php',
    }
    async.series([
      (cb) => helpers.copyFiles(this.sourceRoot(), files, cb),
      (cb) => this._updateWpConfig(cb),
    ], (err) => {
      if(err)
        throw err;
      this.log('Local config generated')
      done();
    });
  }

});

module.exports = WpConfigGenerator;

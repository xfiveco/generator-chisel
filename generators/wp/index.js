'use strict';

var yeoman = require('yeoman-generator'),
  remote = require('yeoman-remote'),
  fs = require('fs'),
  crypto = require('crypto'),
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
  },

  prompting: function() {
    var prompts = [
      {
        name: 'databaseHost',
        message: 'Enter the database host',
        default: '$_SERVER[\'DB_HOST\']'
      }, {
        name: 'databaseName',
        message: 'Enter the database name',
        default: '$_SERVER[\'DB_NAME\']'
      }, {
        name: 'databaseUser',
        message: 'Enter the database user',
        default: '$_SERVER[\'DB_USER\']'
      }, {
        name: 'databasePassword',
        message: 'Enter the database password',
        default: '$_SERVER[\'DB_PASSWORD\']'
      }
    ];

    var done = this.async();
    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      done();
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
      (cb) => fs.readFile('wp/wp-config-sample.php', 'utf8', cb),
      (config, cb) => {
        var prefix = this.configuration.nameSlug.replace(/-/g, '_');
        config = config
          .replace('\'localhost\'', this._getDbSetting('databaseHost'))
          .replace('\'database_name_here\'', this._getDbSetting('databaseName'))
          .replace('\'username_here\'', this._getDbSetting('databaseUser'))
          .replace('\'password_here\'', this._getDbSetting('databasePassword'))
          .replace('wp_', prefix + '_');

        config = config.replace('<?php',
          '<?php\n'+
          'define(\'DISALLOW_FILE_EDIT\', !!$_SERVER[\'DISABLE_EDIT\']);\n'+
          'define(\'DISALLOW_FILE_MODS\', !!$_SERVER[\'DISABLE_EDIT\']);');

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

  /**
   * We need to run async _updateWpConfig after install unfortunately
   * runInstall creates separated element at run loop so we can't use
   * this.async(). Also runInstall calls its done() automatically after
   * calling our callback so we are synchronously adding new element to
   * run loop with config update.
   */
  install: function() {
    this.runInstall('composer', null, null, (err) => {
      if(err)
        throw err;
    });
  },

  end: function() {
    var done = this.async();
    async.series([
      (cb) => this._updateWpConfig(cb),
      (cb) => fs.rename('wp/wp-content/themes/chisel-starter-theme',
        'wp/wp-content/themes/x5-theme', cb)
    ], (err) => {
      if(err)
        throw err;
      this.log('Everything went well :)')
      done();
    })
  }
});

module.exports = WpGenerator;

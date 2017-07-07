'use strict';
var Generator = require('yeoman-generator'),
  fs = require('fs'),
  helpers = require('../../helpers'),
  async = require('async'),
  mysql = require('mysql');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  initializing() {
    this.configuration = this.config.get('config');
    this.wpDir = this.configuration.wpDir || 'wp';
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  }

  _prompting(cb) {
    var prompts = [
      {
        name: 'databaseHost',
        message: 'Enter the database host:',
        default: '127.0.0.1'
      }, {
        name: 'databasePort',
        message: 'Enter the database port:',
        default: 3306,
        validate: function (input) {
          if (isNaN(input)) {
            return 'Please, enter number';
          }
          return true;
        }
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
      this.prompts['databaseHostPort'] = answers['databaseHost'] + ':' + answers['databasePort'];
      cb();
    });
  }

  prompting() {
    var done = this.async();
    async.doDuring(
      (cb) => this._prompting(cb),
      (cb) => {
        // In tests we are passing String object instead of empty string
        // because yeoman-test seems to ignore empty string
        var connection = new mysql.createConnection({
          host: this.prompts.databaseHost,
          port: this.prompts.databasePort,
          user: this.prompts.databaseUser,
          password: this.prompts.databasePassword.toString()
        });
        connection.connect((err) => {
          if(err) {
            console.log('Error when testing database connection:');
            console.log(err.toString());
          } else {
            connection.destroy();
          }
          cb(null, err);
        })
      },
      helpers.throwIfError(done)
    );
  }

  writing() {
    var name = this.configuration.nameSlug;
    this.fs.copyTpl(this.templatePath('dev-vhost.conf'),
      this.destinationPath('dev-vhost.conf'), {
        documentRoot: process.cwd()+'/'+this.wpDir,
        serverName: name + '.test',
        dbName: name
      }
    );
  }

  /**
   * Wrap setting in quotes if needed.
   */
  _getDbSetting(setting) {
    var val = this.prompts[setting];
    if(val.startsWith('$_')) {
      return val;
    }
    // TODO That's not proper escaping
    return '\'' + this.prompts[setting] + '\'';
  }

  _updateWpConfig(cb) {
    async.waterfall([
      (cb) => fs.readFile(this.wpDir+'/wp-config-local.php', 'utf8', cb),
      (config, cb) => {
        var prefix = helpers.makePrefix(this.configuration.nameSlug);
        config = config
          .replace('\'localhost\'', this._getDbSetting('databaseHostPort'))
          .replace('\'database_name_here\'', this._getDbSetting('databaseName'))
          .replace('\'username_here\'', this._getDbSetting('databaseUser'))
          .replace('\'password_here\'', this._getDbSetting('databasePassword'))
          .replace('wp_', prefix + '_');

        fs.writeFile(this.wpDir+'/wp-config-local.php', config, cb);
      }
    ], cb);
  }

  install() {
    var done = this.async();
    var files = {
      'wp-config-local.php': this.wpDir+'/wp-config-local.php',
    }
    async.series([
      (cb) => helpers.copyFiles(this.sourceRoot(), files, cb),
      (cb) => this._updateWpConfig(cb),
    ], (err) => {
      if(err) {
        throw err;
      }
      this.log('Local config generated')
      done();
    });
  }
}

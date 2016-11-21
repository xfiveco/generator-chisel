'use strict';

var yeoman = require('yeoman-generator'),
  fs = require('fs'),
  crypto = require('crypto'),
  helpers = require('../../helpers'),
  wpCli = require('../../helpers/wpCli'),
  async = require('async'),
  cp = require('child_process'),
  path = require('path'),
  chalk = require('chalk');

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
    if(!this.options['skip-config']) {
      this.composeWith(path.join(__dirname, '../wp-config'))
    }
    if(!this.options['skip-plugins']) {
      this.composeWith(path.join(__dirname, '../wp-plugins'));
    }
  },

  prompting: function() {
    var prompts = [
      {
        name: 'title',
        message: 'Enter title for the new site:',
        default: this.configuration.name
      }, {
        name: 'url',
        message: 'Enter URL:',
        default: 'http://'+this.configuration.nameSlug+'.dev/'
      }, {
        name: 'adminUser',
        message: 'Enter admin user:',
        default: 'admin'
      }, {
        name: 'adminPassword',
        message: 'Enter admin password:',
        type: 'password',
        validate: (str) => (str.length > 0)
      }, {
        name: 'adminEmail',
        message: 'Enter admin email:',
        validate: (str) => /.+@.+/.test(str),
        default: () => {
          try {
            var email = cp.execSync('git config user.email', {
              timeout: 2000
            });
            email = email.toString('utf8').trim();
            if(/.+@.+/.test(email)) {
              return email;
            }
          } catch(e) {}
          return undefined;
        }
      }
    ];

    var done = this.async();
    this.log(chalk.yellow('\nWORDPRESS SETUP\n'));
    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      done();
    });
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

  _copyTheme: function() {
    this.fs.copyTpl(this.templatePath('chisel-starter-theme'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug), this.configuration);
    this.fs.move(
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/gitignore'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/.gitignore')
    );
  },

  _checkIfDatabaseExists: function(cb) {
    wpCli(['db', 'check'], {hideStdio: true}, (err, stdio) => {
      var stdout = stdio[0].toString('utf8');
      var stderr = stdio[1].toString('utf8');
      if(stderr.indexOf('Unknown database') != -1) {
        cb(null, false);
      } else if(stdout.indexOf('Success') != -1) {
        cb(null, true);
      } else {
        cb(['Error when checking database', stdout, stderr]);
      }
    });
  },

  _askIfContinueWithCurrentDb: function(cb) {
    this.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Database already exist, do you want to use existing database?'
      }
    ]).then((answers) => {
      if(answers.continue) {
        cb(null, [])
      } else {
        cb('You decided to not continue');
      }
    });
  },

  _dropCreateDatabase: function(cb) {
    async.waterfall([
      (cb) => this._checkIfDatabaseExists(cb),
      (exists, cb) => (exists ? wpCli(['db', 'drop'], cb) : cb(null, [])),
      (stdio, cb) => this._checkIfDatabaseExists(cb),
      (exists, cb) =>
        (exists ? this._askIfContinueWithCurrentDb(cb) : wpCli(['db', 'create'], cb)),
    ], cb);
  },

  _runWpCli: function(cb) {
    if(this.options.skipWpCli) {
      cb(); return;
    }
    async.series([
      (cb) => this._dropCreateDatabase(cb),
      (cb) => wpCli(['core', 'install', {
        url: this.prompts.url,
        title: this.prompts.title,
        admin_user: this.prompts.adminUser,
        admin_password: this.prompts.adminPassword,
        admin_email: this.prompts.adminEmail
      }], cb),
      (cb) => wpCli(['option', 'update', 'blog_public', '0'], cb),
      (cb) => wpCli(['plugin', 'install', 'timber-library', {activate: true}], cb),
      (cb) => wpCli(['theme', 'activate', this.configuration.nameSlug], cb)
    ], cb);
  },

  install: function() {
    this._copyTheme();
    var done = this.async();
    wpCli(['core', 'download'], helpers.throwIfError(done))
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
      (cb) => this._runWpCli(cb)
    ], helpers.throwIfError(done));
  }
});

module.exports = WpGenerator;

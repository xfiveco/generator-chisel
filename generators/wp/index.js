'use strict';

const Generator = require('yeoman-generator');
const fs = require('fs');
const fse = require('fs-extra');
const crypto = require('crypto');
const helpers = require('../../helpers');
const wpCli = require('../../helpers/wpCli');
const async = require('async');
const cp = require('child_process');
const chalk = require('chalk');

const WP_CONFIG_UNIQUE_STRING_BYTES = 30;
const STDOUT = 0;
const STDERR = 1;

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  initializing () {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
    if(!this.options['skip-config']) {
      this.composeWith(require.resolve('../wp-config'))
    }
    if(!this.options['skip-plugins']) {
      this.composeWith(require.resolve('../wp-plugins'));
    }
  }

  prompting() {
    var prompts = [
      {
        name: 'title',
        message: 'Enter title for the new site:',
        default: this.configuration.name
      }, {
        name: 'url',
        message: 'Enter URL:',
        default: this.configuration.nameSlug + '.dev'
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
      }, {
        type: 'list',
        name: 'srcPlacement',
        message: 'Where do you want to place the \'src\' folder:',
        choices: [{
          name: 'Project root folder',
          value: 'root'
        }, {
          name: 'WordPress theme folder',
          value: 'theme'
        }]
      }
    ];

    var done = this.async();
    this.log(chalk.yellow('\nWORDPRESS SETUP\n'));
    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      done();
    });
  }

  updateProxyTarget() {
    this.configuration["proxyTarget"] = this.prompts.url;
    this.config.set("config", this.configuration);
  }

  _updateWpConfig(cb) {
    async.waterfall([
      (cb) => fs.readFile('wp/wp-config.php', 'utf8', cb),
      (config, cb) => {
        var prefix = helpers.makePrefix(this.configuration.nameSlug);
        config = config.replace('wp_', prefix + '_');

        config = config.replace(/put your unique phrase here/g,
          () => crypto.randomBytes(WP_CONFIG_UNIQUE_STRING_BYTES).toString('base64'))

        fs.writeFile('wp/wp-config.php', config, cb);
      }
    ], cb);
  }

  _updateSrcFolderConfig() {
    fs.readFile('package.json', 'utf8', (err, config) => {
      if (err) {
        throw err;
      } else {
        config = config.replace('"base": "src"', '"base": "wp/wp-content/themes/'+this.configuration.nameSlug+'/src"');
        fs.writeFile('package.json', config, (err) => {
          if (err) {
            throw err;
          } else {
            console.log('Updated the src path.');
          }
        });
      }
    });
  }

  _moveSrcFolder() {
    fse.move(
      this.destinationPath('src'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/src'),
      function (err) {
        if (err) {
          return console.error(err);
        } else {
          console.log("The src folder moved to the theme folder.")
        }
      }
    );
  }

  _copyTheme() {
    // Copy Chisel starter theme
    this.fs.copyTpl(this.templatePath('chisel-starter-theme'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug), this.configuration);

    // Copy screenshot
    this.fs.copy(this.templatePath('images/screenshot.png'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/screenshot.png'));

    // Copy Twig templates from the main generator
    this.fs.copyTpl(this.templatePath(__dirname + '/../app/templates/templates/twig/**/*'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/templates/'), this.configuration);

    // Rename style guide so it works as WP page template
    this.fs.move(
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/templates/style-guide.twig'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/templates/page-style-guide.twig')
    );

    this.fs.move(
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/gitignore'),
      this.destinationPath('wp/wp-content/themes/'+this.configuration.nameSlug+'/.gitignore')
    );
  }

  _copyThemeStyles() {
    this.fs.copyTpl(this.templatePath('styles/itcss/**/*'),
      this.destinationPath('src/styles/'), this.configuration);
  }

  _checkIfDatabaseExists(cb) {
    wpCli(['db', 'check'], {hideStdio: true}, (err, stdio) => {
      var stdout = stdio[STDOUT].toString('utf8');
      var stderr = stdio[STDERR].toString('utf8');
      if(stderr.indexOf('Unknown database') != -1) {
        cb(null, false);
      } else if(stdout.indexOf('Success') != -1) {
        cb(null, true);
      } else {
        cb(['Error when checking database', stdout, stderr]);
      }
    });
  }

  _askIfContinueWithCurrentDb(cb) {
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
  }

  _dropCreateDatabase(cb) {
    async.waterfall([
      (cb) => this._checkIfDatabaseExists(cb),
      (exists, cb) => (exists ? wpCli(['db', 'drop'], cb) : cb(null, [])),
      (stdio, cb) => this._checkIfDatabaseExists(cb),
      (exists, cb) =>
        (exists ? this._askIfContinueWithCurrentDb(cb) : wpCli(['db', 'create'], cb)),
    ], cb);
  }

  _runWpCli(cb) {
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
      (cb) => wpCli(['plugin', 'install', 'timber-library', {activate: true}], cb),
      (cb) => wpCli(['theme', 'activate', this.configuration.nameSlug], cb)
    ], cb);
  }

  install() {
    this._copyTheme();
    this._copyThemeStyles();
    var done = this.async();
    wpCli(['core', 'download'], helpers.throwIfError(done))
  }

  end() {
    var done = this.async();
    var files = {
      'wp-config.php': 'wp/wp-config.php',
      'gitignore': 'wp/.gitignore',
      '.htaccess': 'wp/.htaccess'
    }
    async.series([
      (cb) => helpers.copyFiles(this.sourceRoot(), files, cb),
      (cb) => this._updateWpConfig(cb),
      (cb) => this._runWpCli(cb)
    ], helpers.throwIfError(done));

    if (this.prompts.srcPlacement === 'theme') {
      this._moveSrcFolder();
      this._updateSrcFolderConfig();
    }
  }
}

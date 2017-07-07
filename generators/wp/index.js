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
const ghGot = require('gh-got');

const WP_CONFIG_UNIQUE_STRING_BYTES = 30;
const STDOUT = 0;
const STDERR = 1;


const PANTHEON_UPSTREAM_API_URL = 'https://api.github.com/repos/jakub300/chisel-pantheon-upstream/git/refs/heads/master';
const PANTHEON_UPSTREAM_WARNING = `
For Pantheon integration to work well your project must be build on top of our Pantheon upstream.
It looks like this project directory is either not a git repository or it is not based on the updstream.

You can reset your master to Chisel upstream using those commands (THIS WILL REMOVE EVRYTHING ON MASTER):
git init # if repository doesn't exist
git fetch -uf https://github.com/jakub300/chisel-pantheon-upstream.git master:master
git checkout -f master

After doing that please restart Chisel. You can also ignore this warning if you know what are doing.
`;

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  initializing () {
    this.configuration = this.config.get('config');
    this.wpDir = this.configuration.wpDir || 'wp';
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
        type: 'confirm',
        name: 'pantheon',
        message: 'Will that site be hosted on Pantheon?',
        default: () => this.wpDir == 'web',
      },
      {
        name: 'pantheonValidated',
        type: 'list',
        message: 'What would you like to do now?',
        choices: [
          {
            name: 'Ignore & continue',
            value: 'ignore',
          },
          {
            name: 'Exit',
            value: 'exit',
          }
        ],
        when: function(answers) {
          if (!answers.pantheon) {
            return false;
          }
          const done = this.async();
          var gitCommit = '';
          var verified = false;

          function finish() {
            if (verified) {
              console.log('We sucessfully verified that your repository is based on Chisel Pantheon Upstream');
              done(null, false);
            } else {
              console.log(PANTHEON_UPSTREAM_WARNING);
              done(null, true);
            }
          }

          try {
            gitCommit = cp
              .execSync('git rev-parse HEAD', { timeout: 2000 })
              .toString('utf8').trim();
          } catch (e) {
          } finally {
            if (!gitCommit) {
              return finish();
            }

            ghGot(PANTHEON_UPSTREAM_API_URL, {
              timeout: 10000,
            }).then(res => {
              verified = res.body && res.body.object && res.body.object.sha && res.body.object.sha == gitCommit;
              finish();
            }, e => {
              console.log(e);
              console.log('We failed to get commit id from GitHub for verification.');
              finish();
            });
          }
        },
      },
      {
        name: 'pantheonCI',
        type: 'list',
        message: 'Which CI would you like to use for deployment to pantheon?',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'GitLab CI',
            value: 'gitlab',
          }
        ],
        default: 'none',
        when: (answers) => {
          if(answers.pantheonValidated == 'exit') {
            process.exit(1);
          }
          return answers.pantheon;
        },
      },
      {
        name: 'title',
        message: 'Enter title for the new site:',
        default: this.configuration.name,
      }, {
        name: 'url',
        message: 'Enter URL:',
        default: 'http://'+this.configuration.nameSlug+'.test/'
      }, {
        name: 'adminUser',
        message: 'Enter admin user:',
        default: () => {
          try {
            var fullName = cp.execSync('git config user.name', {
              timeout: 2000
            });
            var nameParts = fullName.toString('utf8').trim().split(" ");
            // eslint-disable-next-line no-magic-numbers
            var name = nameParts[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000);
            return name;
          } catch(e) {}
          return undefined;
        }
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
      if(this.prompts.pantheon) {
        this.wpDir = 'web';
      }
      done();
    });
  }

  _updateWpConfig(cb) {
    async.waterfall([
      (cb) => fs.readFile(this.wpDir+'/wp-config.php', 'utf8', cb),
      (config, cb) => {
        var prefix = helpers.makePrefix(this.configuration.nameSlug);
        config = config.replace('wp_', prefix + '_');

        config = config.replace(/put your unique phrase here/g,
          () => crypto.randomBytes(WP_CONFIG_UNIQUE_STRING_BYTES).toString('base64'))

        fs.writeFile(this.wpDir+'/wp-config.php', config, cb);
      }
    ], cb);
  }

  _updateSrcFolderConfig() {
    fs.readFile('package.json', 'utf8', (err, config) => {
      if (err) {
        throw err;
      } else {
        config = config.replace('"base": "src"', '"base": "'+this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug+'/src"');
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
      this.destinationPath(this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug+'/src'),
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
      this.destinationPath(this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug), this.configuration);

    // Copy screenshot
    this.fs.copy(this.templatePath('images/screenshot.png'),
      this.destinationPath(this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug+'/screenshot.png'));

    this.fs.move(
      this.destinationPath(this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug+'/gitignore'),
      this.destinationPath(this.wpDir+'/wp-content/themes/'+this.configuration.nameSlug+'/.gitignore')
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
    if(!this.prompts.pantheon) {
      var done = this.async();
      wpCli(['core', 'download'], helpers.throwIfError(done));
    }
  }

  end() {
    var done = this.async();
    var files = {
      '.htaccess': this.wpDir+'/.htaccess'
    }
    if(!this.prompts.pantheon) {
      Object.assign(files, {
        'wp-config.php': this.wpDir+'/wp-config.php',
        'gitignore': this.wpDir+'/.gitignore',
      })
    } else {
      Object.assign(files, {
        'pantheon.yml': 'pantheon.yml',
        'pushback.php': this.wpDir+'/private/scripts/chisel/pushback.php',
      })
    }

    if(this.prompts.pantheonCI == 'gitlab') {
      Object.assign(files, {
        '.gitlab-ci.yml': '.gitlab-ci.yml',
      })
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

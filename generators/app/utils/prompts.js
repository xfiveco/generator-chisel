'use strict';

var _ = require('lodash');
var path = require('path');
var limax = require('limax');
const cp = require('child_process');
const updateNotifier = require('update-notifier');
const packageJson = require('../../../package.json');
let hasUpdate = false;

function slug(str) {
  return limax(str, {separateNumbers: false}).replace(/[^a-z0-9-]/g, '-');
}

const FIRST_LETTER = 0;
const SECOND_LETTER = 1;
const ONE_CHARACTER = 1;
const CHISEL_VERSION_CHECK_TIMEOUT = 5000;

var Prompts = {
  questions: [
    {
      type: 'confirm',
      name: 'ignoreOutdatedChisel',
      message: 'Are you sure you want to continue?',
      default: false,
      when: function() {
        const done = this.async();
        let calledDone = false;
        const notifier = updateNotifier({
          pkg: packageJson,
          callback: (err, update) => {
            if(calledDone) {
              return;
            }
            calledDone = true;
            if(update && update.type && update.type != 'latest') {
              notifier.update = update;
              hasUpdate = true;
              notifier.notify({defer: false, isGlobal: true});
              return done(null, true);
            }
            done(null, false);
          },
        })
        setTimeout(function() {
          if(calledDone) {
            return;
          }
          calledDone = true;
          done(null, false);
        }, CHISEL_VERSION_CHECK_TIMEOUT);
      }
    },
    {
      name: 'name',
      message: 'Please enter the project name:',
      default: () => path.basename(process.cwd())
        .split(/-/g)
        .map(word => `${word.substring(FIRST_LETTER, ONE_CHARACTER).toUpperCase()}${word.substring(SECOND_LETTER)}`)
        .join(' '),
      validate: function (input) {
        return !!input;
      },
      when: function(answers) {
        if(hasUpdate && !answers.ignoreOutdatedChisel) {
          process.exit(1);
        }
        return true;
      }
    },
    {
      name: 'author',
      message: 'Please enter author name:',
      default: () => {
        try {
          var fullName = cp.execSync('git config user.name', {
            timeout: 2000
          });
          var name = fullName.toString('utf8').trim();
          return name;
        } catch(e) {}
        return undefined;
      }
    },
    {
      type: 'list',
      name: 'projectType',
      message: 'Please select project type:',
      choices: [{
        name: 'Front-end only',
        value: 'fe'
      }, {
        name: 'WordPress with Front-end',
        value: 'wp-with-fe'
      }]
    },
    {
      type: 'list',
      name: 'styling',
      message: 'How much ITCSS styling should be included?',
      choices: [
        {
          name: 'Full (with style guide)',
          value: 'full_styleguide',
        },
        {
          name: 'Full',
          value: 'full',
        },
        {
          name: 'Minimal',
          value: 'minimal',
        },
      ]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select additional front-end features:',
      choices: [{
        name: 'ES6 with Babel',
        value: 'has_babel',
        checked: true
      }, {
        name: 'jQuery',
        value: 'has_jquery',
        checked: false
      }]
    },
    {
      when: function (answers) {
        if ( !Array.isArray(answers.features) ) {
          return;
        }

        return answers.features.some(function (answer) {
          return answer === 'has_jquery';
        });
      },
      type: 'confirm',
      name: 'has_jquery_vendor_config',
      message: 'Would you like to configure browserify-shim for jQuery plugins?',
      default: true
    }
  ],

  setAnswers: function (answers) {
    this.prompts = {};

    this.prompts.name = answers.name;
    this.prompts.author = answers.author;
    this.prompts.projectType = answers.projectType;
    this.prompts.nameSlug = slug(answers.name);
    this.prompts.nameCamel = _.upperFirst(_.camelCase(answers.name));
    this.prompts.hasFullStyling = answers.styling == 'full' || answers.styling == 'full_styleguide';
    this.prompts.hasStyleGuide = answers.styling == 'full_styleguide';
    this.prompts.features = {};
    this.prompts.chiselVersion = packageJson.version;

    for (var i in answers.features) {
      this.prompts.features[answers.features[i]] = true;
    }

    this.prompts.has_jquery_vendor_config = answers.has_jquery_vendor_config;
  }
};

module.exports = Prompts;

'use strict';

var _ = require('lodash');
var path = require('path');
var limax = require('limax');

function slug(str) {
  return limax(str).replace(/[^a-z0-9-]/g, '-');
}

const FIRST_LETTER = 0;
const SECOND_LETTER = 1;
const ONE_CHARACTER = 1;

var Prompts = {
  questions: [
    {
      name: 'name',
      message: 'Please enter the project name:',
      default: () => path.basename(process.cwd())
        .split(/-/g)
        .map(word => `${word.substring(FIRST_LETTER, ONE_CHARACTER).toUpperCase()}${word.substring(SECOND_LETTER)}`)
        .join(' '),
      validate: function (input) {
        return !!input;
      }
    },
    {
      name: 'author',
      message: 'Please enter author name:',
      default: 'Xfive'
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

    for (var i in answers.features) {
      this.prompts.features[answers.features[i]] = true;
    }

    this.prompts.has_jquery_vendor_config = answers.has_jquery_vendor_config;
  }
};

module.exports = Prompts;

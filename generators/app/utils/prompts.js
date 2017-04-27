'use strict';

var _ = require('lodash');
var path = require('path');

var Prompts = {
  questions: [
    {
      name: 'name',
      message: 'Please enter the project name:',
      default: () => path.basename(process.cwd())
                    .split(/-/g)
                    .map(word => `${word.substring(0,1).toUpperCase()}${word.substring(1)}`)
                    .join(" "),
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
      type: 'checkbox',
      name: 'features',
      message: 'Select additional front-end features:',
      choices: [{
        name: 'jQuery',
        value: 'has_jquery',
        checked: false
      }, {
        name: 'ES2015 with Babel',
        value: 'has_babel',
        checked: false
      }]
    }
  ],

  setAnswers: function (answers) {
    this.prompts = {};

    this.prompts.name = answers.name;
    this.prompts.author = answers.author;
    this.prompts.projectType = answers.projectType;
    this.prompts.nameSlug = _.toLower(answers.name.replace(/\s/g, "-"));
    this.prompts.nameCamel = _.capitalize(_.camelCase(answers.name));
    this.prompts.features = {};

    for (var i in answers.features) {
      this.prompts.features[answers.features[i]] = true;
    }
  }
};

module.exports = Prompts;

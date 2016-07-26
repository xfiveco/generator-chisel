'use strict';

var helpers = {
  copy: function (template, destination, context) {
    if (context && Object.keys(context).length) {
      this.fs.copyTpl(this.templatePath(template), this.destinationPath(destination), context);
    } else {
      this.fs.copy(this.templatePath(template), this.destinationPath(destination));
    }
  }
};

var Generator = {
  config: function () {
    this.config.set('config', this.prompts);
  },

  dotfiles: function () {
    helpers.copy.call(this, '.*', '');
    helpers.copy.call(this, 'assets/**/.*', 'src/assets/');
  },

  appfiles: function () {
    helpers.copy.call(this, 'package.json', 'package.json', this.prompts);
  },

  gulpfiles: function () {
    helpers.copy.call(this, 'gulpfile.js', 'gulpfile.js', this.prompts);
    helpers.copy.call(this, 'gulp/**/*', 'gulp/', this.prompts);
  },

  projectInfo: function () {
    helpers.copy.call(this, 'project-index.html', 'project-index.html', this.prompts);
    helpers.copy.call(this, 'README.md', 'README.md', this.prompts);
  },

  templates: function () {
    helpers.copy.call(this, 'templates/twig/**/*', 'src/templates/', this.prompts);
  },

  stylesheets: function () {
    helpers.copy.call(this, 'styles/itcss/**/*', 'src/styles/', this.prompts);
  },

  javascripts: function () {
    helpers.copy.call(this, 'scripts/browserify/**/*', 'src/scripts/', this.prompts);
  }
};

module.exports = Generator;

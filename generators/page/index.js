'use strict';

var yeoman = require('yeoman-generator');
var _ = require('lodash');

var PageChisel = yeoman.Base.extend({
  /**
   * Extends base Yeoman constructor
   * @public
   */
  constructor: function () {
    yeoman.Base.apply(this, arguments);
    this.sourceRoot(this.destinationRoot());

    this.option('skip-build', {
      desc: 'Do not run `gulp build` after pages are created',
      type: Boolean,
      defaults: false
    });
  },

  /**
   * Reads current generator config and list of pages
   * @public
   */
  initializing: function () {
    try {
      this.configuration = this.config.get('config');
    } catch (ex) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }

    if(this.configuration.features && this.configuration.features.has_wp) {
      this.log('You can\'t add pages to WordPress projects.');
      process.exit();
    }

    this.pages = this.config.get('pages');
  },

  /**
   * Gets generator arguments
   * @public
   */
  prompting: {
    /**
     * Gets new pages listed in arguments and checks if there're any pages to render
     * @public
     */
    checkNames: function () {
      this.argument('newPages', {
        desc: 'List of names',
        type: Array,
        required: false
      });

      this.pages = _.union(this.pages, this.newPages);

      if (_.isEmpty(this.pages)) {
        this.log('Page names list cannot be empty.');
        process.exit();
      }
    },

    /**
     * Checks if there are any reserved names in pages array
     * @public
     */
    checkReservedNames: function () {
      var reservedNames = ['_template'];
      var isReserved = function (page) {
        return _.includes(reservedNames, _.kebabCase(page));
      };

      if (_.some(this.pages, isReserved, this)) {
        this.log('You cannot use those reserved words: ' + reservedNames.join(', ') + '.');
        process.exit();
      }
    }
  },

  /**
   * Updated the generator config file with new pages
   * @public
   */
  configuring: function () {
    this.config.set('pages', this.pages);
  },

  /**
   * Generates template files based on provided list or stored in config file
   * @public
   */
  writing: {
    /**
     * Generates template files based on provided list or stored in config file
     * @public
     */
    generatePages: function () {
      this.pages.forEach(function(pageName) {
        var fileName = _.kebabCase(pageName) + '.twig';

        // Write file if not exists
        if (!this.fs.exists(this.destinationPath('src/templates/' + fileName))) {
          this.fs.copyTpl(this.templatePath('src/templates/_template.twig'), this.destinationPath('src/templates/' + fileName), {
            pageName: pageName
          });
        }
      }, this);
    },

    /**
     * Updates main project page listing with generated page list
     * @public
     */
    updateIndex: function () {
      var pagesObject = [];

      this.pages.forEach(function(page) {
        pagesObject.push({ name: page, slug: _.kebabCase(page) });
      });

      this.fs.copyTpl(this.templatePath('index/project-index.html'), this.destinationPath('index.html'), { pages: pagesObject });
    }

  },

  /**
   * Runs build helpers if they're not skipped by generator
   * @public
   */
  install: function () {
    if (!this.options['skip-build']) {
      this.spawnCommand('gulp', ['build']);
    }

    this.log('All done!');
  }
});

module.exports = PageChisel;

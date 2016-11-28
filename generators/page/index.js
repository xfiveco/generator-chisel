'use strict';

var yeoman = require('yeoman-generator');
var _ = require('lodash');
var wpCli = require('../../helpers/wpCli');
var async = require('async');
var path = require('path');
var helpers = require('../../helpers');

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
  _writing_fe: {
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

  _wp_single: function(pageName, callback) {
    var id = 0;
    var slug = '';
    async.waterfall([
      (cb) => wpCli(['post', 'create', {
        post_type: 'page',
        post_title: pageName,
        post_status: 'publish'
      }], cb),
      (stdio, cb) => {
        var stdout = stdio[0].toString('utf8');
        id = /Created post (\d+)\./.exec(stdout)[1];
        cb(!id);
      },
      (cb) => wpCli(['post', 'get', String(id), {format: 'json'}], {hideStdio: true}, cb),
      (stdio, cb) => {
        var json = JSON.parse(stdio[0]);
        slug = json.post_name;
        cb(!slug);
      },
      (cb) => {
        var pack = JSON.parse(this.fs.read(this.destinationPath('package.json')));
        var chisel = pack.chisel, dest = chisel.dest;
        var templates = path.join(dest.wordpress, 'wp-content/themes',
          dest.wordpressTheme, chisel.src.templatesPath);
        this.fs.copyTpl(
          this.destinationPath(path.join(templates, 'page.twig')),
          this.destinationPath(path.join(templates, 'page-'+slug+'.twig')),
          {pageName: pageName}
        );
        cb();
      }
    ], callback);
  },

  _writing_wp_with_fe: function(callback) {
    async.eachSeries(this.newPages, this._wp_single.bind(this), callback);
  },


  writing: function() {
    if(this.configuration.projectType == 'wp-with-fe') {
      var done = this.async();
      this._writing_wp_with_fe(helpers.throwIfError(done));
    } else {
      this._writing_fe.generatePages.call(this);
      this._writing_fe.updateIndex.call(this);
    }
  },

  /**
   * Runs build helpers if they're not skipped by generator
   * @public
   */
  install: function () {
    if (!this.options['skip-build'] && this.configuration.projectType == 'fe') {
      this.spawnCommand('gulp', ['build']);
    }

    this.log('All done!');
  }
});

module.exports = PageChisel;

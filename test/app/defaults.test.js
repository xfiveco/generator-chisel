'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with default options', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Test Project',
        author: 'Test Author',
        features: []
      })
      .on('end', done);
  });

  it('can be imported without blowing up', function (done) {
    assert(require('../../generators/app') !== undefined);

    done();
  });

  it('should generate configuration files', function (done) {
    assert.file([
      '.editorconfig',
      '.gitattributes',
      '.eslintrc.yml',
      '.stylelintrc.yml',
      '.gitignore',
      'package.json',
      'index/project-index.html',
      'index/css/main.css',
      'README.md'
    ]);

    done();
  });

  it('should generate gulp files', function (done) {
    assert.file([
      'gulpfile.js',
      'gulp/helpers.js',
      'gulp/tasks/assets.js',
      'gulp/tasks/build.js',
      'gulp/tasks/lint.js',
      'gulp/tasks/scripts.js',
      'gulp/tasks/serve.js',
      'gulp/tasks/styles.js',
      'gulp/tasks/templates.js'
    ]);

    done();
  });

  it('should generate templates', function (done) {
    assert.file([
      'src/templates/_template.twig',
      'src/templates/layouts/base.twig'
    ]);

    done();
  });

  it('should generate stylesheets', function (done) {
    assert.file([
      'src/styles/main.scss',
      'src/styles/settings/_settings.global.scss',
      'src/styles/tools/_tools.breakpoints.scss',
      'src/styles/tools/_tools.clearfix.scss',
      'src/styles/tools/_tools.hidden.scss',
      'src/styles/generic/_generic.box-sizing.scss',
      'src/styles/generic/_generic.normalize.scss',
      'src/styles/generic/_generic.reset.scss',
      'src/styles/generic/_generic.shared.scss',
      'src/styles/elements/_elements.headings.scss',
      'src/styles/elements/_elements.hr.scss',
      'src/styles/elements/_elements.images.scss',
      'src/styles/elements/_elements.links.scss',
      'src/styles/elements/_elements.lists.scss',
      'src/styles/elements/_elements.page.scss',
      'src/styles/elements/_elements.tables.scss',
      'src/styles/objects/_objects.layout.scss',
      'src/styles/objects/_objects.list-bare.scss',
      'src/styles/objects/_objects.list-inline.scss',
      'src/styles/objects/_objects.media.scss',
      'src/styles/objects/_objects.table.scss',
      'src/styles/objects/_objects.wrapper.scss',
      'src/styles/components/_components.buttons.scss',
      'src/styles/components/_components.footer.scss',
      'src/styles/utilities/_utilities.clearfix.scss',
      'src/styles/utilities/_utilities.hide.scss'
    ]);

    done();
  });

  it('should generate scripts', function (done) {
    assert.file([
      'src/scripts/app.js',
      'src/scripts/greeting.js'
    ]);

    done();
  });

  it('should generate assets structure', function (done) {
    assert.file([
      'src/assets/fonts/.keep',
      'src/assets/images/.keep'
    ]);

    done();
  });

  it('should generate proper app name in every file', function (done) {
    assert.fileContent('package.json', '"name": "test-project"');
    assert.fileContent('index/project-index.html', 'Project Index - Test Project');

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"name": "Test Project"');
    assert.fileContent('.yo-rc.json', '"author": "Test Author"');

    done();
  });

  it('should create index file without pages', function (done) {
    assert.file('index.html');
    assert.fileContent('index.html', 'Your pages will appear here.');

    done();
  });
});

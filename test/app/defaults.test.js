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
      '.bowerrc',
      '.editorconfig',
      '.gitattributes',
      '.eslintrc',
      '.gitignore',
      '.npmignore',
      'package.json',
      'project-index.html',
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
      'src/templates/template.twig',
      'src/templates/base.twig'
    ]);

    done();
  });

  it('should generate stylesheets', function (done) {
    assert.file([
      'src/styles/main.scss'
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
    assert.fileContent('project-index.html', 'Project Index - Test Project');

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"name": "Test Project"');
    assert.fileContent('.yo-rc.json', '"author": "Test Author"');

    done();
  });
});

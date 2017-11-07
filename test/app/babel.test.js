'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with ES2015 and Babel', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Test Project',
        author: 'Test Author',
        features: ['has_babel']
      })
      .on('end', done);
  });

  it('should add Babel ES2015 preset and Babelify as dependencies to package.json', function (done) {
    assert.fileContent('package.json', '"babel-preset-es2015":');
    assert.fileContent('package.json', '"babelify":');

    done();
  });

  it('should add Babelify transform to the Gulp scripts task', function (done) {
    assert.file('gulp/tasks/scripts.js');
    assert.fileContent('gulp/tasks/scripts.js', "transform: [");
    assert.fileContent('gulp/tasks/scripts.js', "'babelify',");

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"has_babel": true' );

    done();
  });

  it('should use eslint-chisel-config', function (done) {
    assert.fileContent('.eslintrc', '"extends": "chisel"');
    assert.fileContent('package.json', '"eslint-config-chisel":');

    done();
  });
});

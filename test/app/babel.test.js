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

  it('should add Babel ES2015 preset and babel-loader as dependencies to package.json', function (done) {
    assert.fileContent('package.json', '"babel-preset-es2015":');
    assert.fileContent('package.json', '"babel-loader":');

    done();
  });

  it('should add babel-loader to webpack config', function (done) {
    assert.file('webpack.chisel.config.js');
    assert.fileContent('webpack.chisel.config.js', "loader: 'babel-loader'");

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

  it('should ES6 commas for Prettier', function (done) {
    assert.fileContent('.prettierrc', '"trailingComma": "all"');

    done();
  });
});

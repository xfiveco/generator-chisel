'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with WordPress', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Test Project',
        author: 'Test Author',
        projectType: 'wp-with-fe'
      })
      .on('end', done);
  });

  it('should add WordPress directory to package.json', function(done) {
    assert.fileContent('package.json', '"wordpress": "wp"');

    done();
  })

  it('should add WP theme name to package.json', function(done) {
    assert.fileContent('package.json', '"wordpressTheme": "test-project"');

    done();
  })

  it('should add proxy to Browsersync config', function(done) {
    assert.fileContent('gulp/tasks/serve.js',
      'target: generator_config.proxyTarget || name+\'.test\',');

    done();
  });

  it('should not add gulp-twig-up-to-date to package.json', function(done) {
    assert.noFileContent('package.json', '"gulp-twig-up-to-date"');

    done();
  });
});

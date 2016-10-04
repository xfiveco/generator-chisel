'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
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
        features: ['has_wp']
      })
      .on('end', done);
  });

  it('should add proxy to Browsersync config', function(done) {
    assert.fileContent('gulp/tasks/serve.js', 'proxy: name+\'.dev\',');

    done();
  });
});

'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with jQuery', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Test Project',
        author: 'Test Author',
        features: ['has_jquery'],
        has_jquery_vendor_config: false
      })
      .on('end', done);
  });

  it('should add jQuery as a dependency in package.json', function (done) {
    assert.fileContent('package.json', '"jquery":');

    done();
  });

  it('should create a jQuery example in a module', function (done) {
    assert.file('src/scripts/modules/greeting.js');
    assert.fileContent('src/scripts/modules/greeting.js', "var $ = require('jquery');");
    assert.fileContent('src/scripts/modules/greeting.js', "var element = $('.js-greeting');");

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"has_jquery": true' );
    assert.fileContent('.yo-rc.json', '"has_jquery_vendor_config": false' );

    done();
  });

  it('should create empty vendor list', function(done) {
    assert.fileContent('src/scripts/vendor.json', '[]');

    done();
  })

  it('should not add jQuery to externals in webpack config', function(done) {
    assert.fileContent('webpack.chisel.config.js', 'externals: {},');

    done();
  })
});

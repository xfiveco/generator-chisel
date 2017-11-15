'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with jQuery in vendor bundle and Babel', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Test Project',
        author: 'Test Author',
        features: ['has_jquery', 'has_babel'],
        has_jquery_vendor_config: true
      })
      .on('end', done);
  });

  it('should add jQuery as a dependency in package.json', function (done) {
    assert.fileContent('package.json', '"jquery":');

    done();
  });

  it('should create a jQuery example in a module', function (done) {
    assert.file('src/scripts/modules/greeting.js');
    assert.fileContent('src/scripts/modules/greeting.js', "import $ from 'jquery';");
    assert.fileContent('src/scripts/modules/greeting.js', "const element = $('.js-greeting');");

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"has_babel": true' );
    assert.fileContent('.yo-rc.json', '"has_jquery": true' );
    assert.fileContent('.yo-rc.json', '"has_jquery_vendor_config": true' );

    done();
  });

  it('should create vendor list with jQuery', function(done) {
    assert.fileContent('src/scripts/vendor.json', '"/node_modules/jquery/dist/jquery.js"');

    done();
  })

  it('should add jQuery to externals in webpack config', function(done) {
    assert.fileContent('webpack.chisel.config.js', "jquery: 'window.jQuery',");

    done();
  })
});

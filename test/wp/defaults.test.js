'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with WordPress (subgenerator)', function () {
  before(function (done) {
    this.timeout(240000)

    helpers
      .run(path.join(__dirname, '../../generators/wp'))
      .withOptions({
        skipInstall: false
      })
      .withLocalConfig({config: {nameSlug: "test-1"}})
      .on('end', done);
  });

  it('should download WordPress', function(done) {
    assert.file('wp/index.php');

    done();
  });

  it('should update wp-config', function(done) {
    assert.fileContent('wp/wp-config.php', '$_SERVER[\'DB_HOST\']');
    assert.fileContent('wp/wp-config.php', 'test_1_');
    assert.fileContent('wp/wp-config.php',
      'define(\'DISALLOW_FILE_EDIT\', !!$_SERVER[\'DISABLE_EDIT\']);');
    assert.noFileContent('wp/wp-config.php', 'put your unique phrase here');

    done();
  })

  it('should download Timber', function(done) {
    assert.file('wp/wp-content/plugins/timber-library/timber.php');

    done();
  });

  it('should download our theme', function(done) {
    assert.file('wp/wp-content/themes/test-1/index.php');

    done();
  })
});

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
        skipInstall: false,
        skipPlugins: true,
        skipWpCli: true,
        skipConfig: true
      })
      .withLocalConfig({config: {nameSlug: "test-1", name: "Test 1", author: "Test Author"}})
      .on('end', done);
  });

  it('should download WordPress', function(done) {
    assert.file('wp/index.php');

    done();
  });

  it('should update wp-config', function(done) {
    assert.fileContent('wp/wp-config.php', 'test_1_');
    assert.noFileContent('wp/wp-config.php', 'put your unique phrase here');

    done();
  })

  it('should add .gitignore', function(done) {
    assert.file('wp/.gitignore');

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

  it('should remove .git from our theme', function(done) {
    assert.noFile('wp/wp-content/themes/test-1/.git');

    done();
  })

  it('should remove out theme from composer', function(done) {
    assert.noFileContent('composer.json', '"xfiveco/chisel-starter-theme": "*"');
    assert.noFileContent('composer.lock', 'xfiveco/chisel-starter-theme');

    done();
  })
});

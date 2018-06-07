'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

const FOUR_MINUTES = 240000;

describe('Chisel Generator with WordPress (subgenerator)', function () {
  before(function (done) {
    this.timeout(FOUR_MINUTES)

    helpers
      .run(path.join(__dirname, '../../../generators/wp'))
      .withOptions({
        skipInstall: false,
        skipPlugins: true,
        skipWpCli: true,
        skipConfig: true
      })
      .withLocalConfig({
        config: {
          nameSlug: "test-1",
          name: "Test 1",
          has_jquery: false,
          has_jquery_vendor_config: false,
          author: "Test Author",
          projectType: 'wp-with-fe',
          srcPlacement: 'root'
        }
      })
      .on('end', done);
  });

  it('should download WordPress', function(done) {
    assert.file('wp/index.php');

    done();
  });

  it('should update wp-config', function(done) {
    assert.fileContent('wp/wp-config.php', '7r4dz5cz_');
    assert.noFileContent('wp/wp-config.php', 'put your unique phrase here');

    done();
  })

  it('should add .gitignore', function(done) {
    assert.file('wp/.gitignore');

    done();
  })

  it('should download our theme', function(done) {
    assert.file('wp/wp-content/themes/test-1-chisel/index.php');

    done();
  })

  it('should remove .git from our theme', function(done) {
    assert.noFile('wp/wp-content/themes/test-1-chisel/.git');

    done();
  })
});

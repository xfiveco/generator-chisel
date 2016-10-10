'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');

describe('Chisel Generator with WordPress (wp-config subgenerator)', function () {
  before(function (done) {
    var context = helpers
      .run(path.join(__dirname, '../../generators/wp-config'))
      .withOptions({
        skipInstall: false
      })
      .withLocalConfig({config: {nameSlug: "test-1"}})
      .on('ready', () => {
        fs.mkdirSync(path.join(context.targetDirectory, 'wp'));
      })
      .on('end', done);
  });

  it('should update wp-config-local', function(done) {
    assert.fileContent('wp/wp-config-local.php', '$_SERVER[\'DB_HOST\']');
    assert.fileContent('wp/wp-config-local.php', 'test_1_');

    done();
  })
});

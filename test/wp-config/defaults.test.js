'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');

describe('Chisel Generator with WordPress (wp-config subgenerator)', function () {
  before(function (done) {
    this.timeout(10000)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    var context = helpers
      .run(path.join(__dirname, '../../generators/wp-config'))
      .withOptions({
        skipInstall: false
      })
      .withPrompts({
        databasePassword: new String('')
      })
      .withLocalConfig({config: {nameSlug: "test-1"}})
      .on('ready', () => {
        fs.mkdirSync(path.join(context.targetDirectory, 'wp'));
      })
      .on('end', done);
  });

  it('should update wp-config-local', function(done) {
    assert.fileContent('wp/wp-config-local.php', '127.0.0.1');
    assert.fileContent('wp/wp-config-local.php', '7r4dz5cz_');

    done();
  })
});

'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var wpCli = require('../../helpers/wpCli');

const TEN_SECONDS = 10000;
const FOUR_MINUTES = 240000;
const STDOUT = 0;

describe('Chisel Generator with WordPress (subgenerator, WP-CLI integration)', function () {
  this.timeout(TEN_SECONDS)

  before(function (done) {
    this.timeout(FOUR_MINUTES)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    helpers
      .run(path.join(__dirname, '../../generators/wp'))
      .withOptions({
        skipInstall: false,
        skipPlugins: true
      })
      .withPrompts({
        databasePassword: new String(''),
        adminPassword: 'pass',
        adminEmail: 'user@example.com'
      })
      .withLocalConfig({config: {nameSlug: "test-1", name: "Test 1", author: "Test Author", projectType: 'wp-with-fe'}})
      .on('end', done);

  });

  it('should install WordPress', function(done) {
    wpCli(['core', 'is-installed'], (err) => {
      assert(!err);
      done();
    })
  });

  it('should install and activate Timber', function(done) {
    wpCli(['plugin', 'status', 'timber-library'], (err, stdio) => {
      assert(stdio[STDOUT].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });

  it('should activate Theme', function(done) {
    wpCli(['theme', 'status', 'test-1-chisel'], (err, stdio) => {
      assert(stdio[STDOUT].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });

  it('should install and activate Disable Emojis Plugin', function(done) {
    wpCli(['plugin', 'status', 'disable-emojis'], (err, stdio) => {
      assert(stdio[STDOUT].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });
});

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');
var async = require('async');
var wpCli = require('../../helpers/wpCli');

describe('Chisel Generator with WordPress (subgenerator, WP-CLI integration)', function () {
  this.timeout(10000)

  before(function (done) {
    this.timeout(240000)

    // We skip those tests when running locally becouse they
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
      .withLocalConfig({config: {nameSlug: "test-1", name: "Test 1", author: "Test Author"}})
      .on('end', done);

  });

  it('should install WordPress', function(done) {
    wpCli(['core', 'is-installed'], (err, stdio) => {
      assert(!err);
      done();
    })
  });

  it('should install and activate Timber', function(done) {
    wpCli(['plugin', 'status', 'timber-library'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });

  it('should activate Theme', function(done) {
    wpCli(['theme', 'status', 'test-1'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });
});

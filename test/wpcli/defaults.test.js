'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');
var async = require('async');
var wpCli = require('../../helpers/wpCli');
var spawn = require('cross-spawn');

describe('Chisel Generator with WordPress (wpcli subgenerator)', function () {
  this.timeout(10000)

  before(function (done) {
    this.timeout(240000)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    async.series([
      function(callback) {
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
          .withLocalConfig({config: {nameSlug: "test-cli", name: "Test Cli", author: "Test Author", projectType: 'wp-with-fe'}})
          .on('end', callback);
      },
      function (callback) {
        spawn('yo', [path.join(__dirname, '../../generators/wpcli'),
            'plugin', 'install', 'rest-api', '--activate'], {stdio: 'inherit'})
          .on('exit', callback)
          .on('error', callback);
      }
    ], done)

  });

  it('should install and activate Rest API', function(done) {
    wpCli(['plugin', 'status', 'rest-api'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  });

});

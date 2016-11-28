'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var async = require('async');
var wpCli = require('../../helpers/wpCli');

describe('Chisel Generator with WordPress (wp-plugins subgenerator)', function () {
  this.timeout(10000)

  before(function (done) {
    this.timeout(240000)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    async.series([
      function (callback) {
        helpers
          .run(path.join(__dirname, '../../generators/app'))
          .withOptions({
            'skip-install': true
          })
          .withPrompts({
            name: 'Test Project Plugins',
            author: 'Test Author',
            projectType: 'wp-with-fe',
            features: []
          })
          .on('end', callback);
      },
      function (callback) {
        helpers
          .run(path.join(__dirname, '../../generators/wp'), {tmpdir: false})
          .withOptions({
            skipInstall: false
          })
          .withPrompts({
            databasePassword: new String(''),
            adminPassword: 'pass',
            adminEmail: 'user@example.com',
            plugins: ['https://github.com/wp-premium/advanced-custom-fields-pro/archive/master.zip',
              'adminer',
              'https://github.com/wp-sync-db/wp-sync-db/archive/master.zip']
          })
          .on('end', callback);
      }
    ], done)
  });

  it('should download and activate ACF', function(done) {
    wpCli(['plugin', 'status', 'advanced-custom-fields-pro'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })

  it('should download and activate Adminer', function(done) {
    wpCli(['plugin', 'status', 'adminer'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })

  it('should download and activate WP Sync DB', function(done) {
    wpCli(['plugin', 'status', 'wp-sync-db'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })
});

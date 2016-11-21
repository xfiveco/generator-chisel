'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var async = require('async');

describe('Chisel Generator with WordPress (wp-plugins subgenerator)', function () {
  before(function (done) {
    this.timeout(240000)

    // We skip those tests when running locally becouse they
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

  it('should do download ACF', function(done) {
    assert.file('wp/wp-content/plugins/advanced-custom-fields-pro/acf.php');

    done();
  })

  it('should do download Adminer', function(done) {
    assert.file('wp/wp-content/plugins/adminer/adminer.php');

    done();
  })

  it('should do download WP Sync DB', function(done) {
    assert.file('wp/wp-content/plugins/wp-sync-db/wp-sync-db.php');

    done();
  })
});

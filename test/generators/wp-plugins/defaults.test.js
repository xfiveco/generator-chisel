'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var wpCli = require('../../../helpers/wpCli');

const TEN_SECONDS = 10000;
const FOUR_MINUTES = 240000;
const STDOUT = 0;

describe('Chisel Generator with WordPress (wp-plugins subgenerator)', function () {
  this.timeout(TEN_SECONDS)

  before(function (done) {
    this.timeout(FOUR_MINUTES)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    helpers
      .run(path.join(__dirname, '../../../generators/app'))
      .withOptions({
        'skip-install': true,
        'run-wp': true
      })
      .withPrompts({
        name: 'Test Project Plugins',
        author: 'Test Author',
        projectType: 'wp-with-fe',
        databasePassword: new String(''),
        adminPassword: 'pass',
        adminEmail: 'user@example.com',
        plugins: ['https://github.com/wp-premium/advanced-custom-fields-pro/archive/master.zip',
          'https://github.com/wp-sync-db/wp-sync-db/archive/master.zip']
      })
      .on('end', done);
  });

  it('should download and activate ACF', function(done) {
    wpCli(['plugin', 'status', 'advanced-custom-fields-pro'], (err, stdio) => {
      assert(stdio[STDOUT].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })

  it('should download and activate WP Sync DB', function(done) {
    wpCli(['plugin', 'status', 'wp-sync-db'], (err, stdio) => {
      assert(stdio[STDOUT].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })
});

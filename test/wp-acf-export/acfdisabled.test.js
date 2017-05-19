'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const async = require('async');
const wpCli = require('../../helpers/wpCli');
const fs = require('fs');

const TEN_SECONDS = 10000;
const FOUR_MINUTES = 240000;

describe('Chisel Generator with WordPress (wp-acf-export subgenerator, ACF disabled, no ACF WP-CLI)', function () {
  this.timeout(TEN_SECONDS)

  before(function (done) {
    this.timeout(FOUR_MINUTES)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    async.series([
      (cb) => {
        helpers
          .run(path.join(__dirname, '../../generators/app'))
          .withOptions({
            'skip-install': true,
            'run-wp': true
          })
          .withPrompts({
            name: 'Test ACF CLI 2',
            author: 'Test Author',
            projectType: 'wp-with-fe',
            features: [],
            databasePassword: new String(''),
            adminPassword: 'pass',
            adminEmail: 'user@example.com',
            plugins: ['https://github.com/wp-premium/advanced-custom-fields-pro/archive/master.zip']
          })
          .on('end', cb);
      },
      (cb) => {
        wpCli(['plugin', 'deactivate', 'advanced-custom-fields-pro'], cb)
      },
      (cb) => {
        // Add and activate cli config
        fs.writeFileSync(
          'wp/wp-content/plugins/acf-wp-cli-configuration.php',
          fs.readFileSync(
            path.join(__dirname, '../../generators/wp-plugins/templates/acf-wp-cli-configuration.php')
          )
        );
        wpCli(['plugin', 'activate', 'acf-wp-cli-configuration'], cb);
      },
      (cb) => {
        helpers
          .run(path.join(__dirname, '../../generators/wp-acf-export'), {tmpdir: false})
          .on('end', cb);
      },
    ], done)
  });

  it('should activate ACF', function(done) {
    wpCli(['plugin', 'status', 'advanced-custom-fields-pro'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })

  it('should download and activate ACF WP-CLI', function(done) {
    wpCli(['plugin', 'status', 'advanced-custom-fields-wpcli'], (err, stdio) => {
      assert(stdio[0].toString('utf8').indexOf('Active') != -1);
      done();
    })
  })

  it('should create export directory', function(done) {
    assert.file('wp/wp-content/themes/test-acf-cli-2/acf-cli-json');

    done();
  })
});

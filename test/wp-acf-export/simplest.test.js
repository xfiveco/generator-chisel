'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const async = require('async');

const TEN_SECONDS = 10000;
const FOUR_MINUTES = 240000;

describe('Chisel Generator with WordPress (wp-acf-export subgenerator)', function () {
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
            name: 'Test ACF CLI 1',
            author: 'Test Author',
            projectType: 'wp-with-fe',
            features: [],
            databasePassword: new String(''),
            adminPassword: 'pass',
            adminEmail: 'user@example.com',
            plugins: [
              'https://github.com/wp-premium/advanced-custom-fields-pro/archive/master.zip',
              'https://github.com/hoppinger/advanced-custom-fields-wpcli/archive/master.zip',
            ]
          })
          .on('end', cb);
      },
      (cb) => {
        helpers
          .run(path.join(__dirname, '../../generators/wp-acf-export'), {tmpdir: false})
          .on('end', cb);
      },
    ], done)
  });

  it('should create export directory', function(done) {
    assert.file('wp/wp-content/themes/test-acf-cli-1/acf-cli-json');

    done();
  })
});

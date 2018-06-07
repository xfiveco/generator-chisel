'use strict';

const path = require('path');
const async = require('async');
const helpers = require('yeoman-test');
const cp = require('child_process');
const fs = require('fs');
const prepare = require('../gulp/environment.js');

const FOUR_MINUTES = 240000;

describe('Gulp build on Chisel Generator (WordPress)', function () {
  this.timeout(FOUR_MINUTES);

  before(function (done) {
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
            'skip-install': true,
            'run-wp': true
          })
          .withPrompts({
            name: 'Test Gulp WP Build',
            author: 'Test Author',
            projectType: 'wp-with-fe',
            features: [],
            databasePassword: new String(''),
            adminPassword: 'pass',
            adminEmail: 'user@example.com',
            plugins: []
          })
          .on('end', callback);
      },
      function (callback) {
        prepare.linkOrInstallModules();
        fs.writeFileSync('src/assets/test.txt', 'abcd-tessst');
        cp.execSync('yarn build');
        callback();
      }
    ], done);
  });

  require('../gulp/gulp.build.shared.js')('wp/wp-content/themes/test-gulp-wp-build-chisel/dist');

});

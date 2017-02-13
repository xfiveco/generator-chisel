'use strict';

var path = require('path');
var async = require('async');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var cp = require('child_process');
var fs = require('fs');
var prepare = require('../prepare_gulp_env.js');

describe('Gulp build on Chisel Generator (WordPress)', function () {
  before(function (done) {
    this.timeout(240000);
    prepare.prepare();

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
        cp.execSync('ln -s '+prepare.getNodeModules()+' node_modules');
        fs.writeFileSync('src/assets/test.txt', 'abcd-tessst');
        cp.execSync('gulp build');
        callback();
      }
    ], done);
  });

  require('../helpers/gulp.build.shared.js')('wp/wp-content/themes/test-gulp-wp-build/dist');

});

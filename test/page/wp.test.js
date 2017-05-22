'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var async = require('async');

const TEN_SECONDS = 10000;
const FOUR_MINUTES = 240000;

describe('Chisel Generator with WordPress (subgenerator, WP-CLI integration)', function () {
  describe('Page subgenerator', function() {
    this.timeout(TEN_SECONDS)

    before(function (done) {
      this.timeout(FOUR_MINUTES)

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
              name: 'Test Project',
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
        function(callback) {
          helpers
            .run(path.join(__dirname, '../../generators/page'), { tmpdir: false })
            .withArguments(['Home', 'Test'])
            .withOptions({
              'skip-build': true
            })
            .on('ready', function (generator) {
              generator.conflicter.force = true;
            })
            .on('end', callback);
        }
      ], done)
    });

    it('should generate Twig templates', function (done) {
      assert.file([
        'wp/wp-content/themes/test-project/templates/page-home.twig',
        'wp/wp-content/themes/test-project/templates/page-test.twig'
      ]);

      done();
    });

    it('should create valid Yeoman configuration file', function (done) {
      assert.file('.yo-rc.json');
      assert.fileContent('.yo-rc.json', '"pages": [');
      assert.fileContent('.yo-rc.json', '"Home"');
      assert.fileContent('.yo-rc.json', '"Test"');

      done();
    });

  })
});

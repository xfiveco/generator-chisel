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

    async.series([
      function (callback) {
        helpers
          .run(path.join(__dirname, '../../generators/app'))
          .withOptions({
            'skip-install': true
          })
          .withPrompts({
            name: 'Test Project',
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
            skipInstall: false,
            skipPlugins: true,
            skipConfig: true,
            localConfig: true
          })
          .withPrompts({
            databasePassword: new String(''),
            adminPassword: 'pass',
            adminEmail: 'user@example.com'
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

  describe('Page subgenerator', function() {
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

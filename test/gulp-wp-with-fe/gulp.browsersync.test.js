'use strict';

var path = require('path');
var async = require('async');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var cp = require('child_process');
var fs = require('fs');
var prepare = require('../prepare_gulp_env.js');
var PhantomInstance = require('../helpers/PhantomInstance');
var phantom = new PhantomInstance();
var GulpInstance = require('../helpers/GulpInstance');
var gulp = new GulpInstance();
var PhpServerInstance = require('../helpers/PhpServerInstance');
var phpServer = new PhpServerInstance();

describe('Browsersync and gulp tests on WordPress project', function () {
  this.timeout(30000);

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
            name: 'Test Browsersync WP',
            author: 'Test Author',
            projectType: 'wp-with-fe',
            features: [],
            url: 'http://localhost:8080/',
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
          .withArguments(['Testing Page'])
          .withOptions({
            'skip-build': true
          })
          .on('ready', function (generator) {
            generator.conflicter.force = true;
          })
          .on('end', callback);
      },
      function(callback) {
        var fileName = 'src/scripts/greeting.js';
        var file = fs.readFileSync(fileName, 'utf8');
        file +=
          fs.readFileSync(path.join(__dirname, '../helpers/phantom_inject.js'))
            .toString('utf8');
        fs.writeFileSync(fileName, file);

        fileName = '.yo-rc.json';
        file = fs.readFileSync(fileName, 'utf8');
        file = JSON.parse(file);
        file['generator-chisel'].config.proxyTarget = 'http://localhost:8080/';
        file = JSON.stringify(file, null, '  ');
        fs.writeFileSync(fileName, file);

        cp.execSync('ln -s '+prepare.getNodeModules()+' node_modules');
        callback();
      },
      function(callback) {
        phpServer.start();
        setTimeout(callback, 2000);
      },
      function(callback) {
        gulp.start();
        gulp.once('ready', () => {
          phantom.start(gulp.localUrl+'/');
          phantom.once('bsConnected', callback);
        })
      }
    ], done);
  });

  it('should reload on modified page', function (done) {
    var fileName = 'wp/wp-content/themes/test-browsersync-wp/templates/page-testing-page.twig';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('id="post-', 'id="testing-post-');
    fs.writeFileSync(fileName, file);

    phantom.once('urlChanged', () => {
      phantom.once('bsConnected', done);
    });
  });

  require('../helpers/gulp.browsersync.shared.js')
    (phantom, 'src', 'wp/wp-content/themes/test-browsersync-wp/dist');

  after(function(done) {
    gulp.stop();
    phantom.stop();
    phpServer.stop();
    done();
  });

});

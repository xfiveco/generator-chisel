'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var cp = require('child_process');
var fs = require('fs');
var async = require('async');
var prepare = require('../prepare_gulp_env.js');
var PhantomInstance = require('../helpers/PhantomInstance');
var phantom = new PhantomInstance();
var GulpInstance = require('../helpers/GulpInstance');
var gulp = new GulpInstance();

describe('Gulp build on Chisel Generator with default options (BrowserSync tests)', function () {
  this.timeout(30000);

  before(function (done) {
    this.timeout(240000);
    prepare.prepare();

      async.series([
        function(callback) {
          helpers
            .run(path.join(__dirname, '../../generators/app'))
            .withOptions({
              'skip-install': true
            })
            .withPrompts({
              name: 'Test Project',
              author: 'Test Author',
              features: [],
              projectType: 'fe'
            })
            .on('end', () => {
              cp.execSync('ln -s '+prepare.getNodeModules()+' node_modules');
              callback();
            });
        },
        function(callback) {
          helpers
            .run(path.join(__dirname, '../../generators/page'), { tmpdir: false })
            .withArguments(['Page1'])
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
          callback();
        },
        function(callback) {
          gulp.start();
          gulp.once('ready', () => {
            phantom.start(gulp.localUrl+'/dist/page-1.html');
            phantom.once('bsConnected', callback);
          })
        },
        (cb) => global.setTimeout(cb, 5000) // TODO: remove
      ], done);
  });

  it('should reload on modified page', function (done) {
    var fileName = 'src/templates/page-1.twig';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('js-greeting', 'js-greeting js-greeting-modified');
    fs.writeFileSync(fileName, file);

    phantom.once('urlChanged', () => {
      assert.fileContent('dist/page-1.html', 'js-greeting-modified');
      phantom.once('bsConnected', done);
    });
  });

  require('../helpers/gulp.browsersync.shared.js')
    (phantom, 'src', 'dist');

  after(function(done) {
    gulp.stop();
    phantom.stop();
    done();
  });


});

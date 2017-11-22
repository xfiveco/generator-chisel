'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const fs = require('fs');
const async = require('async');
const puppeteer = require('puppeteer');
const browsersyncHelpers = require('../gulp/browsersyncHelpers.js');
const prepare = require('../gulp/environment.js');
const GulpInstance = require('../gulp/GulpInstance');
const gulp = new GulpInstance();

const FOUR_MINUTES = 240000;

let browser = null;
let page = null;

describe('Gulp build on Chisel Generator with default options (BrowserSync tests)', function () {
  this.timeout(FOUR_MINUTES);

  before(function (done) {
    this.timeout(FOUR_MINUTES);

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
            prepare.linkOrInstallModules();
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
        gulp.start();
        gulp.once('ready', () => {
          puppeteer.launch()
            .then(br => {
              browser = br;
              return browser.newPage();
            })
            .then(p => {
              page = p;
              browsersyncHelpers.monitor(page);
              page.goto(gulp.localUrl+'/dist/page-1.html')
              return browsersyncHelpers.waitFor(page);
            })
            .then(callback);
        })
      },
    ], done);
  });

  it('should reload on modified page', function (done) {
    var fileName = 'src/templates/page-1.twig';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('js-greeting', 'js-greeting js-greeting-modified');
    fs.writeFileSync(fileName, file);

    page.once('chiselNavigated', () => {
      assert.fileContent('dist/page-1.html', 'js-greeting-modified');
      browsersyncHelpers.waitFor(page).then(done);
    })
  });

  require('../gulp/gulp.browsersync.shared.js')(() => page, 'src', 'dist');

  after(function(done) {
    gulp.stop();
    browser.close();
    done();
  });
});

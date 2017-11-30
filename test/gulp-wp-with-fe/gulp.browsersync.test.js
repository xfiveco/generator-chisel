'use strict';

const path = require('path');
const async = require('async');
const helpers = require('yeoman-test');
const cp = require('child_process');
const fs = require('fs');
const puppeteer = require('puppeteer');
const browsersyncHelpers = require('../gulp/browsersyncHelpers.js');
const prepare = require('../gulp/environment.js');
const GulpInstance = require('../gulp/GulpInstance');
const PhpServerInstance = require('../gulp/PhpServerInstance');
const gulp = new GulpInstance();
const phpServer = new PhpServerInstance();

const FOUR_MINUTES = 240000;

let browser = null;
let page = null;

describe('Browsersync and gulp tests on WordPress project', function () {
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
        const fileName = '.yo-rc.json';
        let file = fs.readFileSync(fileName, 'utf8');
        file = JSON.parse(file);
        file['generator-chisel'].config.proxyTarget = 'http://localhost:8080/';
        file = JSON.stringify(file, null, '  ');
        fs.writeFileSync(fileName, file);

        prepare.linkOrInstallModules();
        callback();
      },
      function(callback) {
        phpServer.start();
        setTimeout(callback, 2000);
      },
      function(callback) {
        gulp.start();
        gulp.once('ready', () => {
          puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          })
            .then(br => {
              browser = br;
              return browser.newPage();
            })
            .then(p => {
              page = p;
              browsersyncHelpers.monitor(page);
              page.goto(gulp.localUrl+'/')
              return browsersyncHelpers.waitFor(page);
            })
            .then(callback);
        });
      }
    ], done);
  });

  it('should reload on modified page', function (done) {
    var fileName = 'wp/wp-content/themes/test-browsersync-wp/templates/page-testing-page.twig';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('id="post-', 'id="testing-post-');
    fs.writeFileSync(fileName, file);

    page.once('chiselNavigated', () => {
      browsersyncHelpers.waitFor(page).then(done);
    });
  });

  require('../gulp/gulp.browsersync.shared.js')(
    () => page,
    'src',
    'wp/wp-content/themes/test-browsersync-wp/dist'
  );

  after(function(done) {
    gulp.stop();
    browser.close();
    phpServer.stop();
    done();
  });

});

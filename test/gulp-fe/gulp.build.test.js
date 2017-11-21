'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const cp = require('child_process');
const fs = require('fs');
const prepare = require('../gulp/environment.js');

const FOUR_MINUTES = 240000;

describe('Gulp build on Chisel Generator with default options', function () {
  before(function (done) {
    this.timeout(FOUR_MINUTES);

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
        fs.writeFileSync('src/assets/test.txt', 'abcd-tessst');
        cp.execSync('yarn build');
        done();
      });
  });

  require('../gulp/gulp.build.shared.js')('dist');

});

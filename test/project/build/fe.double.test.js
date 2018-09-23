'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cp = require('child_process');
const fs = require('fs');
const prepare = require('../helpers/environment.js');

const FOUR_MINUTES = 240000;

describe('Project > Build > FE Double', function () {
  this.timeout(FOUR_MINUTES);

  before(function (done) {
    helpers
      .run(path.join(__dirname, '../../../generators/app'))
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
        fs.unlinkSync('src/assets/test.txt');
        fs.writeFileSync('src/assets/test2.txt', 'abcd-tessst-seeecond');
        cp.execSync('yarn build');
        done();
      });
  });

  it('should remove old assets', function (done) {
    assert.noFile('dist/assets/test.txt');

    done();
  });

  it('should copy assets', function (done) {
    assert.fileContent('dist/assets/test2.txt', 'abcd-tessst-seeecond');

    done();
  });

});

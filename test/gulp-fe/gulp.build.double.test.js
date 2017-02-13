'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var cp = require('child_process');
var fs = require('fs');
var prepare = require('../prepare_gulp_env.js');

describe('Gulp build (double) on Chisel Generator with default options', function () {
  before(function (done) {
    this.timeout(240000);
    prepare.prepare();

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
        fs.writeFileSync('src/assets/test.txt', 'abcd-tessst');
        cp.execSync('gulp build');
        fs.unlinkSync('src/assets/test.txt');
        fs.writeFileSync('src/assets/test2.txt', 'abcd-tessst-seeecond');
        cp.execSync('gulp build');
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

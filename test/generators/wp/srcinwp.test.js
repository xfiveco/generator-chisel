'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

const FOUR_MINUTES = 240000;

describe('Chisel Generator with WordPress (subgenerator, src inside theme)', function () {
  before(function (done) {
    this.timeout(FOUR_MINUTES)

    // We skip those tests when running locally because they
    // require database at 127.0.0.1 with root user and no password.
    if(!process.env.TRAVIS) {
      this.skip(); return;
    }

    helpers
      .run(path.join(__dirname, '../../../generators/app'))
      .withOptions({
        'skip-install': true,
        'run-wp': true
      })
      .withPrompts({
        name: 'Test Project SRC in WP',
        author: 'Test Author',
        projectType: 'wp-with-fe',
        databasePassword: new String(''),
        adminPassword: 'pass',
        adminEmail: 'user@example.com',
        plugins: [],
        srcPlacement: 'theme'
      })
      .on('end', done);
  });

  it('should have no src in main directory', function(done) {
    assert.noFile('src');

    done();
  })

  it('should move base src into theme directory', function(done) {
    var base = 'wp/wp-content/themes/test-project-src-in-wp-chisel/src';
    assert.file([
      base,
      base+'/assets/images/.keep',
      base+'/scripts/app.js',
      base+'/styles/main.scss',
      base+'/styles/settings/_global.scss',
      base+'/styles/components/_header.scss'
    ]);

    done();
  })

  it('should move WP-specific styles into theme directory', function(done) {
    var base = 'wp/wp-content/themes/test-project-src-in-wp-chisel/src';
    assert.file([
      base+'/styles/components/_comment.scss',
      base+'/styles/components/_post.scss'
    ]);

    done();
  })
});

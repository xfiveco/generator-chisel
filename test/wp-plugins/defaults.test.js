'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fs = require('fs');
var cp = require('child_process');

describe('Chisel Generator with WordPress (wp-plugins subgenerator)', function () {
  before(function (done) {
    this.timeout(240000);

    var context = helpers
      .run(path.join(__dirname, '../../generators/wp-plugins'))
      .withLocalConfig({config: {}})
      .withPrompts({
        plugins: ['xfiveco/advanced-custom-fields-pro',
          'wpackagist-plugin/adminer',
          'wp-sync-db/wp-sync-db']
      })
      .on('ready', () => {
        fs.writeFileSync(path.join(context.targetDirectory, 'composer.json'),
          fs.readFileSync(path.join(__dirname,
            '../../generators/wp/templates/composer.json')))
      })
      .on('end', done);
  });

  it('should do download ACF', function(done) {
    assert.file('wp/wp-content/plugins/advanced-custom-fields-pro/acf.php');

    done();
  })

  it('should do download Adminer', function(done) {
    assert.file('wp/wp-content/plugins/adminer/adminer.php');

    done();
  })

  it('should do download WP Sync DB', function(done) {
    assert.file('wp/wp-content/plugins/wp-sync-db/wp-sync-db.php');

    done();
  })
});

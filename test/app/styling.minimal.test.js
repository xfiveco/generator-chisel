'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Chisel Generator with default options (except styling set to minimal)', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        name: 'Hello2d Wąęśźorld_2 :D',
        author: 'Test Author',
        projectType: 'fe',
        styling: 'minimal'
      })
      .on('end', done);
  });

  require('./defaults.shared.js')();

  it('should generate templates', function (done) {
    assert.file([
      'src/templates/components/footer.twig',
      'src/templates/components/header.twig',
      'src/templates/layouts/base.twig',
      'src/templates/layouts/page.twig',
      'src/templates/objects/.keep',
      'src/templates/utilities/.keep',
    ]);

    done();
  });

  it('should generate stylesheets', function (done) {
    assert.file([
      'src/styles/main.scss',
      'src/styles/settings/_global.scss',
      'src/styles/tools/_breakpoints.scss',
      'src/styles/tools/_clearfix.scss',
      'src/styles/tools/_hidden.scss',
      'src/styles/generic/_box-sizing.scss',
      'src/styles/generic/_font-face.scss',
      'src/styles/generic/_normalize.scss',
      'src/styles/generic/_reset.scss',
      'src/styles/generic/_shared.scss',
      'src/styles/elements/_blockquote.scss',
      'src/styles/elements/_headings.scss',
      'src/styles/elements/_hr.scss',
      'src/styles/elements/_html.scss',
      'src/styles/elements/_images.scss',
      'src/styles/elements/_links.scss',
      'src/styles/elements/_lists.scss',
      'src/styles/elements/_tables.scss',
      'src/styles/objects/_wrapper.scss',
      'src/styles/components/_footer.scss',
      'src/styles/components/_header.scss',
      'src/styles/utilities/_hide.scss',
    ]);

    done();
  });

  it('should not have link to Style Guide in index', function (done) {
    assert.noFileContent('index.html', '<a href="dist/style-guide.html"');

    done();
  });

});

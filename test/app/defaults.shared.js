var assert = require('yeoman-assert');

function addTests() {
  it('can be imported without blowing up', function (done) {
    assert(require('../../generators/app') !== undefined);

    done();
  });

  it('should generate configuration files', function (done) {
    assert.file([
      '.editorconfig',
      '.eslintrc.yml',
      '.gitattributes',
      '.stylelintrc.yml',
      '.gitignore',
      'package.json',
      'index/project-index.html',
      'index/css/main.css',
      'README.md'
    ]);

    done();
  });

  it('should generate gulp files', function (done) {
    assert.file([
      'gulpfile.js',
      'gulp/helpers.js',
      'gulp/tasks/assets.js',
      'gulp/tasks/build.js',
      'gulp/tasks/lint.js',
      'gulp/tasks/scripts.js',
      'gulp/tasks/serve.js',
      'gulp/tasks/styles.js',
      'gulp/tasks/templates.js'
    ]);

    done();
  });

  it('should generate scripts', function (done) {
    assert.file([
      'src/scripts/app.js',
      'src/scripts/greeting.js'
    ]);

    done();
  });

  it('should generate assets structure', function (done) {
    assert.file([
      'src/assets/fonts/.keep',
      'src/assets/images/.keep'
    ]);

    done();
  });

  it('should generate proper app name in every file', function (done) {
    assert.fileContent('package.json', '"name": "hello2d-waeszorld-2-d"');
    assert.fileContent('index/project-index.html', 'Project Index - Hello2d Wąęśźorld_2 :D');

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"name": "Hello2d Wąęśźorld_2 :D"');
    assert.fileContent('.yo-rc.json', '"author": "Test Author"');
    assert.fileContent('.yo-rc.json', /"chiselVersion": "(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?"/)

    done();
  });

  it('should create index file without pages', function (done) {
    assert.file('index.html');
    assert.fileContent('index.html', 'To add more pages run');

    done();
  });

  it('should add gulp-twig to package.json', function(done) {
    assert.fileContent('package.json', '"gulp-twig"');

    done();
  });
}

module.exports = addTests;

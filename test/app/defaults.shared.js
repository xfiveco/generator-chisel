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
    assert.fileContent('package.json', '"name": "hello2-waeszorld-2-d"');
    assert.fileContent('index/project-index.html', 'Project Index - Hello2 Wąęśźorld_2 :D');

    done();
  });

  it('should create valid Yeoman configuration file', function (done) {
    assert.file('.yo-rc.json');
    assert.fileContent('.yo-rc.json', '"name": "Hello2 Wąęśźorld_2 :D"');
    assert.fileContent('.yo-rc.json', '"author": "Test Author"');

    done();
  });

  it('should create index file without pages', function (done) {
    assert.file('index.html');
    assert.fileContent('index.html', 'To add more pages run');

    done();
  });

  it('should add gulp-twig-up-to-date to package.json', function(done) {
    assert.fileContent('package.json', '"gulp-twig-up-to-date"');

    done();
  });
}

module.exports = addTests;

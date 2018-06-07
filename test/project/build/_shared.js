const assert = require('yeoman-assert');
const fs = require('fs');

function addTests(dist) {
  it('should generate proper rev-manifest.json', function (done) {
    assert.file(dist+'/rev-manifest.json');
    assert.fileContent(dist+'/rev-manifest.json', '"app.bundle.js"');
    assert.fileContent(dist+'/rev-manifest.json', '"app.bundle.js.map"');
    assert.fileContent(dist+'/rev-manifest.json', '"main.css"');
    assert.fileContent(dist+'/rev-manifest.json', '"main.css.map"');

    assert.fileContent(dist+'/rev-manifest.json', /"app-[0-9a-z]+\.bundle\.js"/);
    assert.fileContent(dist+'/rev-manifest.json', /"app-[0-9a-z]+\.bundle\.js\.map"/);
    assert.fileContent(dist+'/rev-manifest.json', /"main-[0-9a-z]+\.css"/);
    assert.fileContent(dist+'/rev-manifest.json', /"main-[0-9a-z]+\.css\.map"/);

    done();
  });

  it('should generate styles', function (done) {
    var manifest = JSON.parse(fs.readFileSync(dist+'/rev-manifest.json'));
    var cssFile = dist+'/styles/'+manifest['main.css'];

    // contains normalize-scss, _list-bare
    assert.fileContent(cssFile, 'bit.ly/normalize-scss');
    assert.fileContent(cssFile, '.o-wrapper');

    // contains sourcemap
    assert.fileContent(cssFile, '/*# sourceMappingURL='+manifest['main.css.map']+' */');

    done();
  });

  it('should generate script', function (done) {
    var manifest = JSON.parse(fs.readFileSync(dist+'/rev-manifest.json'));
    var jsFile = dist+'/scripts/'+manifest['app.bundle.js'];

    // contains greeting
    assert.fileContent(jsFile, 'document.querySelector(".js-greeting")');

    // contains sourcemap
    assert.fileContent(jsFile, '//# sourceMappingURL='+manifest['app.bundle.js.map']);

    done();
  });

  it('should copy assets', function (done) {
    assert.fileContent(dist+'/assets/test.txt', 'abcd-tessst');

    done();
  });
}

module.exports = addTests;

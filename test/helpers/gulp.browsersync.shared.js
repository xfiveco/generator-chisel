var assert = require('yeoman-assert');
var fs = require('fs');

function addTests(phantom, srcDir, distDir) {
  it('should reload on modified script', function (done) {
    var fileName = srcDir+'/scripts/greeting.js';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('= name', '= "xfive tests js"');
    fs.writeFileSync(fileName, file);

    phantom.once('urlChanged', () => {
      assert.fileContent(distDir+'/scripts/bundle.js', 'xfive tests js');
      assert.fileContent(distDir+'/scripts/bundle.js.map', 'xfive tests js');
      phantom.once('bsConnected', done);
    });
  });

  it('should inject modified CSS file', function(done) {
    var fileName = srcDir+'/styles/elements/_headings.scss';
    var file = fs.readFileSync(fileName, 'utf8');
    file += 'h1 {color: red;}'
    fs.writeFileSync(fileName, file);
    phantom.once('bsNotify', (msg) => {
      assert.fileContent(distDir+'/styles/main.css', 'color: red;');
      assert.fileContent(distDir+'/styles/main.css.map', 'h1 {color: red;}');
      assert.deepEqual(msg, {"kind":"bsNotify","text":"Injected: main.css"});
      done();
    });
  });
}

module.exports = addTests;

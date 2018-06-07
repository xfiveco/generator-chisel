const assert = require('yeoman-assert');
const fs = require('fs');
const browsersyncHelpers = require('../gulp/browsersyncHelpers.js');

function addTests(page, srcDir, distDir) {
  before(() => {
    page = page();
  });

  it('should reload on modified script', function (done) {
    var fileName = srcDir+'/scripts/modules/greeting.js';
    var file = fs.readFileSync(fileName, 'utf8');
    file = file.replace('= name;', '= "xfive tests js";');
    fs.writeFileSync(fileName, file);

    page.once('chiselNavigated', () => {
      assert.fileContent(distDir+'/scripts/app.bundle.js', 'xfive tests js');
      browsersyncHelpers.waitFor(page).then(done);
    });
  });

  it('should inject modified CSS file', function(done) {
    var fileName = srcDir+'/styles/elements/_headings.scss';
    var file = fs.readFileSync(fileName, 'utf8');
    file += 'h1 {color: red;}'
    fs.writeFileSync(fileName, file);

    function requestHandler(req) {
      if(req.url().includes('main.css?browsersync')) {
        page.removeListener('requestfinished', requestHandler);
        assert.fileContent(distDir+'/styles/main.css', 'color: red;');
        assert.fileContent(distDir+'/styles/main.css.map', 'h1 {color: red;}');
        done();
      }
    }

    page.on('requestfinished', requestHandler);
  });
}

module.exports = addTests;

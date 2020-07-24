// We have those tests in separate files so jest runs them in separate processes.
// This works around problems with require cache preserved between runs
// (possibly related to import-fresh).

function pageMatchesSnapshot() {
  global.chiselTestHelpers.fileMatchesSnapshot('./dist/some-page.html');
}

module.exports.defaultAnswers = require('../helpers').defaultAnswers;
module.exports.somePageSimple = require('../helpers').somePageSimple;

module.exports.pageMatchesSnapshot = pageMatchesSnapshot;

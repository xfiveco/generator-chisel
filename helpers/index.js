var path = require('path');
var fs = require('fs');
var async = require('async');

var Helpers = {
  copyFiles: function(sourceRoot, files, cb) {
    async.eachOfSeries(files, (newName, oldName, cb) => {
      async.waterfall([
        (cb) => fs.readFile(path.join(sourceRoot, oldName), cb),
        (body, cb) => fs.writeFile(newName, body, cb)
      ], cb);
    }, cb);
  }
};

module.exports = Helpers;

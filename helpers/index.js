var path = require('path');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');

var Helpers = {
  copyFiles: function(sourceRoot, files, cb) {
    async.eachOfSeries(files, (newName, oldName, cb) => {
      async.waterfall([
        (cb) => fs.readFile(path.join(sourceRoot, oldName), cb),
        (body, cb) => fs.writeFile(newName, body, cb)
      ], cb);
    }, cb);
  },
  throwIfError: function(cb) {
    return function(err) {
      if(err) {
        throw err;
      }
      cb();
    }
  },
  makePrefix: function(nameSlug) {
    return crypto.createHash('sha256')
      .update(nameSlug, 'utf8')
      .digest('base64')
      .replace(/[+/=]/g, '')
      .substr(0, 8);
  }
};

module.exports = Helpers;

'use strict';

var through = require('through2');

// Globally omit stack trace
Error.stackTraceLimit = 0;
var helpers = function (gulp, plugins, config) {
  return {
    onError: function (error) {
      console.error(error.message + '\n');
      console.error(error.stack + '\n');

      this.emit('end');
    },
    removeSourceMap: function() {
      return through.obj(function(file, enc, callback) {
        delete file.sourceMap;
        this.push(file);
        callback();
      });
    }
  }
};

module.exports = helpers;

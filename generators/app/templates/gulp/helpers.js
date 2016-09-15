'use strict';

// Globally omit stack trace
Error.stackTraceLimit = 0;
var helpers = function (gulp, plugins, config) {
  return {
    onError: function (error) {
      console.error(error.message + '\n');
      console.error(error.stack + '\n');

      this.emit('end');
    }
  }
};

module.exports = helpers;

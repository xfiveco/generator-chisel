// Based on https://www.npmjs.com/package/webpack-mild-compile @1.0.0
/* eslint-disable no-param-reassign */

'use strict';

function MildCompile() {}

MildCompile.prototype.apply = function mildCompile(compiler) {
  const timefix = 11000;
  compiler.plugin('watch-run', (watching, callback) => {
    watching.startTime += timefix;
    callback();
  });
  compiler.plugin('done', stats => {
    stats.startTime -= timefix;
  });
};

module.exports = MildCompile;

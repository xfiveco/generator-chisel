'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var plugins = require('gulp-load-plugins')({ pattern: '*' });
var config  = require('./package.json').chisel;
var generator_config = require('./.yo-rc.json')['generator-chisel'].config;
var helpers = require('./gulp/helpers')(gulp, plugins, config);
config = require('./gulp/prepareConfig')(config);

try {
  var generator_config_local = require('./.yo-rc-local.json')['generator-chisel'].config;
  _.merge(generator_config, generator_config_local);
} catch(e) {}

/**
 * Batch tasks loader
 */
plugins.glob.sync('gulp/tasks/*').forEach(function (path) {
  path = path.replace('gulp/', './gulp/');
  require(path)(gulp, plugins, config, helpers, generator_config);
});

gulp.task('default', ['serve', 'watchify']);

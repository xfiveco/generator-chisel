'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({ pattern: '*' });
var config  = require('./package.json').chisel;
var generator_config = require('./.yo-rc.json')['generator-chisel'].config;
var helpers = require('./gulp/helpers')(gulp, plugins, config);
config = require('./gulp/prepareConfig')(config);
/**
 * Batch tasks loader
 */
plugins.glob.sync('gulp/tasks/*').forEach(function (path) {
  path = path.replace('gulp/', './gulp/');
  require(path)(gulp, plugins, config, helpers, generator_config);
});

gulp.task('default', ['serve', 'watchify']);

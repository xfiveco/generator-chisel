'use strict';

const gulp = require('gulp');
const _ = require('lodash');
const plugins = require('gulp-load-plugins')({
  pattern: '*',
  rename: { 'stylelint': 'stylelintLib', 'eslint': 'eslintLib' },
});
let config = require('./package.json').chisel;
const generatorConfig = require('./.yo-rc.json')['generator-chisel'].config;
const helpers = require('./gulp/helpers')(gulp, plugins, config);
config = require('./gulp/prepareConfig')(config);

try {
  // eslint-disable-next-line global-require, import/no-unresolved
  const generatorConfigLocal = require('./.yo-rc-local.json')[
    'generator-chisel'
  ].config;
  _.merge(generatorConfig, generatorConfigLocal);
} catch (e) {
  // Do nothing
}

/**
 * Batch tasks loader
 */
plugins.glob.sync('gulp/tasks/*').forEach(path => {
  const fixedPath = path.replace('gulp/', './gulp/');
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(fixedPath)(gulp, plugins, config, helpers, generatorConfig);
});

gulp.task('default', ['serve', 'scripts-watch']);

gulp.once('task_start', task => {
  process.env.NODE_ENV = task.task === 'build' ? 'production' : 'development';
});

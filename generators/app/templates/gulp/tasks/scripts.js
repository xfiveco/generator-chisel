'use strict';

const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const browserSync = require('browser-sync');

let webpackConfig;

function webpackDone(isDev) {
  // Based on https://github.com/webpack/webpack-cli/blob/1eb340f4f32bb5303de9355d51e0bcf712755c0b/bin/webpack.js
  return (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      process.exit(1); // eslint-disable-line
    }
    let statsConfig = webpackConfig.stats || 'normal';
    if (typeof statsConfig == 'string') {
      statsConfig = stats.constructor.presetToOptions(statsConfig);
      Object.assign(statsConfig, { colors: true });
    }
    console.log(stats.toString(statsConfig));
    if(isDev) {
      browserSync.reload();
    }
  }
}

var scriptsTask = function(gulp, plugins, config, helpers) {
  gulp.task('scripts-load-config', function() {
    return require('../../webpack.chisel.config.js')().then(config => {
      webpackConfig = config;
    });
  });

  gulp.task('scripts-watch', ['scripts-load-config'], function() {
    gulp
      .src(path.join(config.src.base, config.src.scriptsMain))
      .pipe(plugins.vinylNamed())
      .pipe(plugins.webpackStream(webpackConfig, webpack, webpackDone(true)))
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
  });

  gulp.task('scripts-build', ['scripts-load-config'], function() {
    return gulp
      .src(path.join(config.src.base, config.src.scriptsMain))
      .pipe(plugins.vinylNamed())
      .pipe(plugins.webpackStream(webpackConfig, webpack, webpackDone(false)))
      .pipe(helpers.stealWebpackManifest())
      .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      .pipe(
        plugins.mirror(
          plugins.uglify(),
          plugins.multipipe(
            helpers.removeSourceMap(),
            plugins.rename({ suffix: '.full' })
          )
        )
      )
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(plugins.rev())
      .pipe(plugins.revReplace())
      .pipe(helpers.prepareWebpackManifest())
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
      .pipe(
        plugins.rev.manifest({
          path: path.join(config.dest.base, config.dest.revManifest),
          base: config.dest.base,
          merge: true,
        })
      )
      .pipe(gulp.dest(config.dest.base));
  });
};

module.exports = scriptsTask;

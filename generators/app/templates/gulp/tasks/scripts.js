'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackConfigGenerator = require('../../webpack.chisel.config.js');

let webpackConfig;

module.exports = function scriptsTask(gulp, plugins, config, helpers) {
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
      if (typeof statsConfig === 'string') {
        statsConfig = stats.constructor.presetToOptions(statsConfig);
        Object.assign(statsConfig, { colors: true });
      }
      const statsString = stats.toString(statsConfig);
      console.log(statsString);
      if (isDev) {<% if(projectType == 'fe') { %>
        if (statsString.includes('manifest-dev.json')) {
          gulp.start('templates-watch');
        } else {
          plugins.browserSync.reload();
        }<% } else { %>
        plugins.browserSync.reload();<% } %>
      }
    };
  }

  gulp.task('scripts-load-config', () =>
    webpackConfigGenerator().then(loadedConfig => {
      webpackConfig = loadedConfig;
    })
  );

  gulp.task('scripts-watch', ['scripts-load-config'], () => {
    gulp
      .src(path.join(config.src.base, config.src.scriptsMain))
      .pipe(plugins.vinylNamed())
      .pipe(plugins.webpackStream(webpackConfig, webpack, webpackDone(true)))
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)));
  });

  gulp.task('scripts-build', ['scripts-load-config'], () =>
    gulp
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
      .pipe(gulp.dest(config.dest.base))
  );
};

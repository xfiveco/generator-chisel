'use strict';

var path = require('path');

var stylesTask = function (gulp, plugins, config, helpers) {

  var postcssPlugins = [
    require('autoprefixer')()
  ];

  gulp.task('styles-watch', function() {
    return gulp.src(path.join(config.src.base, config.src.stylesMain))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.sassGlob())
      .pipe(plugins.sass({ outputStyle: 'expanded', includePaths: ['node_modules'] }))
      .pipe(plugins.postcss(postcssPlugins))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.styles)))
      .pipe(plugins.browserSync.stream({ match: '**/*.css' }));
  });

  gulp.task('styles-build', ['assets-build', 'lint-css'], function() {
    return gulp.src(path.join(config.src.base, config.src.stylesMain))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.sassGlob())
      .pipe(plugins.sass({ outputStyle: 'expanded', includePaths: ['node_modules'] }))
      .pipe(plugins.postcss(postcssPlugins))
      .pipe(plugins.mirror(
        plugins.cleanCss(),
        plugins.multipipe(
          helpers.removeSourceMap(),
          plugins.rename({suffix: '.full'})
        )
      ))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(plugins.rev())
      .pipe(plugins.revReplace())
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.styles)))
      .pipe(plugins.rev.manifest({
        path: path.join(config.dest.base, config.dest.revManifest),
        base: config.dest.base
      }))
      .pipe(gulp.dest(config.dest.base))
      .pipe(plugins.browserSync.stream());
  });
};

module.exports = stylesTask;

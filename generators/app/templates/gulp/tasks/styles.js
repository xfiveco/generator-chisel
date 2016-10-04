'use strict';

var stylesTask = function (gulp, plugins, config, helpers) {

  gulp.task('styles-watch', function() {
    return gulp.src(config.src.stylesMain)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.cssGlobbing({ extensions: ['.scss', '.css'] }))
      .pipe(plugins.sass({ outputStyle: 'expanded', includePaths: ['node_modules'] }))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest(config.dest.styles))
      .pipe(plugins.browserSync.stream({ match: '**/*.css' }));
  });

  gulp.task('styles-build', ['assets-build', 'lint-css'], function() {

    var postcssPlugins = [
      require('autoprefixer')()
    ];

    return gulp.src(config.src.stylesMain)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.cssGlobbing({ extensions: ['.scss', '.css'] }))
      .pipe(plugins.sass({ outputStyle: 'expanded', includePaths: ['node_modules'] }))
      .pipe(plugins.postcss(postcssPlugins))
      .pipe(plugins.cleanCss())
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(plugins.rev())
      .pipe(plugins.revReplace())
      .pipe(gulp.dest(config.dest.styles))
      .pipe(plugins.rev.manifest({
        path: config.dest.revManifest,
        base: config.dest.base,
        merge: true
      }))
      .pipe(gulp.dest(config.dest.base))
      .pipe(plugins.browserSync.stream());
  });
};

module.exports = stylesTask;

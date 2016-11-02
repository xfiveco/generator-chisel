'use strict';

var path = require('path');

var assetsTask = function (gulp, plugins, config, helpers) {
  gulp.task('assets-clean', function() {
    return plugins.del([path.join(config.dest.base, config.dest.assets)]);
  })

  gulp.task('assets-build', ['assets-clean'], function () {
    return gulp.src([path.join(config.src.base, config.src.assets), '!**/.keep'],
      { base: config.src.base })
      .pipe(gulp.dest(config.dest.base))
      .on('end', plugins.browserSync.reload);
  });

  gulp.task('assets-watch', function () {
    return gulp.src([path.join(config.src.base, config.src.assets), '!**/.keep'],
      { base: config.src.base })
      .pipe(plugins.newer(config.dest.base))
      .pipe(gulp.dest(config.dest.base))
      .on('end', plugins.browserSync.reload);
  });
};

module.exports = assetsTask;

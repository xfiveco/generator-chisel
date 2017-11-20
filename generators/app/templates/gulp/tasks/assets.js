'use strict';

const path = require('path');

module.exports = function assetsTask(gulp, plugins, config) {
  const { dest, src } = config;

  gulp.task('assets-clean', () =>
    plugins.del([path.join(dest.base, dest.assets)])
  );

  gulp.task('assets-build', ['assets-clean'], () =>
    gulp
      .src([path.join(src.base, src.assets), '!**/.keep'], {
        base: src.base,
      })
      .pipe(gulp.dest(dest.base))
      .on('end', plugins.browserSync.reload)
  );

  gulp.task('assets-watch', () =>
    gulp
      .src([path.join(src.base, src.assets), '!**/.keep'], {
        base: src.base,
      })
      .pipe(plugins.newer(dest.base))
      .pipe(gulp.dest(dest.base))
      .on('end', plugins.browserSync.reload)
  );
};

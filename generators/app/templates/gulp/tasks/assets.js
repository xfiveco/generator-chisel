'use strict';

var assetsTask = function (gulp, plugins, config, helpers) {
  gulp.task('assets', ['clean'], function () {

    var stream = gulp.src([config.src.assets, '!**/.keep'], { base: config.src.base })
      .pipe(plugins.newer(config.dest.base))
      .pipe(gulp.dest(config.dest.base))
      .on('end', plugins.browserSync.reload);

    return stream;
  });
};

module.exports = assetsTask;

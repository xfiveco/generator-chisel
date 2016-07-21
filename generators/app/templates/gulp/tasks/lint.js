'use strict';

var lintTask = function (gulp, plugins, config) {
  gulp.task('lint', function() {
    return gulp.src([config.src.scripts,'!node_modules/**'])
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.eslint.failAfterError());
  });
};

module.exports = lintTask;

'use strict';

var buildTask = function (gulp, plugins, config) {

  gulp.task('clean', function() {
    return plugins.del([config.dest.base]);
  });

  gulp.task('build', plugins.sequence('lint-js', 'styles-build', 'templates-build', 'validate-html'))
};

module.exports = buildTask;

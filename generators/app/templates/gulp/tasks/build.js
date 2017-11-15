'use strict';

var buildTask = function (gulp, plugins, config) {

  gulp.task('clean', function() {
    return plugins.del([config.dest.base]);
  });

  <% if(projectType == 'wp-with-fe') { %>
  gulp.task('build', plugins.sequence('clean', 'styles-build', 'lint-js', 'scripts-build', 'vendor-build'))
  <% } else { %>
  gulp.task('build', plugins.sequence('clean', 'styles-build', 'lint-js', 'scripts-build', 'vendor-build', 'templates-build', 'validate-html'))
  <% } %>
};

module.exports = buildTask;

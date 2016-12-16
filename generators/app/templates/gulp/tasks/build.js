'use strict';

var buildTask = function (gulp, plugins, config) {

  gulp.task('clean', function() {
    return plugins.del([config.dest.base]);
  });

  <% if(projectType == 'wp-with-fe') { %>
  gulp.task('build', plugins.sequence('styles-build', 'lint-js', 'scripts-build'))
  <% } else { %>
  gulp.task('build', plugins.sequence('styles-build', 'lint-js', 'scripts-build', 'templates-build', 'validate-html'))
  <% } %>
};

module.exports = buildTask;

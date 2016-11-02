'use strict';

var path = require('path');

var lintTask = function (gulp, plugins, config) {
  gulp.task('lint-js', function() {
    return gulp.src([path.join(config.src.base, config.src.scripts), '!node_modules/**'])
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.eslint.failAfterError());
  });

  gulp.task('lint-css', function() {
    return gulp.src(path.join(config.src.base, config.src.styles))
      .pipe(plugins.stylelint({
        reporters: [
          {formatter: 'string', console: true}
        ]
      }));
  });

  gulp.task('validate-html', function() {
    return gulp.src(config.dest.base + '/**/*.html')
      .pipe(plugins.htmlhint())
      .pipe(plugins.htmlhint.reporter())
  });
};

module.exports = lintTask;

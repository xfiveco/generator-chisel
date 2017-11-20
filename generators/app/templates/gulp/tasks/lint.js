'use strict';

const path = require('path');

module.exports = function lintTask(gulp, plugins, config) {
  const { src, dest } = config;

  gulp.task('lint-js', () =>
    gulp
      .src(path.join(src.base, src.scripts))
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.eslint.failAfterError())
  );

  gulp.task('lint-css', () =>
    gulp.src(path.join(src.base, src.styles)).pipe(
      plugins.stylelint({
        reporters: [{ formatter: 'string', console: true }],
      })
    )
  );

  gulp.task('validate-html', () =>
    gulp
      .src(`${dest.base}/**/*.html`)
      .pipe(plugins.htmlhint('.htmlhintrc'))
      .pipe(plugins.htmlhint.reporter())
  );
};

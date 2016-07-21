'use strict';

var fs = require('fs');

var templatesTask = function (gulp, plugins, config, helpers) {

  function templates(manifest) {
    return gulp.src(config.src.templates)
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.twigUpToDate({ 
        functions: [
          {
            name: "assetPath",
            func: function (path) {
              if (manifest) {
                return manifest[path];
              } else {
                return path;
              }
            }
          }
        ],
        errorLogToConsole: true 
      }))
      .pipe(plugins.prettify({ indent_size: 2, preserve_newlines: true }))
      .pipe(gulp.dest(config.dest.base))
      .on('end', plugins.browserSync.reload);
  }

  gulp.task('templates-watch', function() {
    templates();
  });

  gulp.task('templates-build', ['scripts-build'], function() {
    var manifest = JSON.parse(fs.readFileSync(config.dest.revManifest, 'utf8'));
    templates(manifest);
  });
};

module.exports = templatesTask;

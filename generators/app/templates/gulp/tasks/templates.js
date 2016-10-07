'use strict';

var fs = require('fs');

var templatesTask = function (gulp, plugins, config, helpers) {

  function templates(manifest) {
    var buildIncludedGlobs = config.src.templatesBuild || '';
    var buildIncludedFilter = plugins.filter(buildIncludedGlobs);

    return gulp.src(config.src.templatesWatch)
      .on('end', plugins.browserSync.reload)
      .pipe(plugins.plumber(helpers.onError))
      .pipe(buildIncludedFilter)
      .pipe(plugins.twigUpToDate({
        base: config.src.templatesPath,
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
      .pipe(gulp.dest(config.dest.base));
  }

  gulp.task('templates-watch', function() {
    return templates();
  });

  gulp.task('templates-build', function() {
    var manifest = JSON.parse(fs.readFileSync(config.dest.revManifest, 'utf8'));
    return templates(manifest);
  });
};

module.exports = templatesTask;

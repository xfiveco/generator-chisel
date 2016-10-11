'use strict';

var fs = require('fs');
var path = require('path');

var templatesTask = function (gulp, plugins, config, helpers) {

  function getTemplateInputData(file) {
    try {
      var data = JSON.parse(
        fs.readFileSync(
          path.join(config.src.dataPath, path.basename(file.path) + '.json')
        )
      );
    } catch(error) {
      // Mute errors related to missing input data & log all other
      if(error.code === 'ENOENT') {
        console.error(e);
      }
    }
    return data || {};
  }

  function templates(manifest) {
    return gulp.src(config.src.templates)
      .pipe(plugins.plumber(helpers.onError))
      .pipe(plugins.data(getTemplateInputData))
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
      .pipe(gulp.dest(config.dest.base))
      .on('end', plugins.browserSync.reload);
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

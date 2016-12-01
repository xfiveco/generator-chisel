'use strict';

var fs = require('fs');
var path = require('path');
var templatesFunctions = require('../templatesFunctions');

var templatesTask = function (gulp, plugins, config, helpers) {

  function getTemplateInputData(file) {
    try {
      var data = JSON.parse(
        fs.readFileSync(
          path.join(config.src.base, config.src.dataPath,
            path.basename(file.path) + '.json')
        )
      );
    } catch (error) {
      // Mute errors related to missing input data & log all other
      if (error.code !== 'ENOENT') {
        console.error(error);
      }
    }
    return data || {};
  }

  function templates(manifest) {
    var buildIncludedGlobs = config.src.templatesBuild || '';
    var buildIncludedFilter = plugins.filter(buildIncludedGlobs);

    return gulp.src(config.src.templatesWatch)
      .on('end', plugins.browserSync.reload)
      .pipe(plugins.plumber(helpers.onError))
      .pipe(buildIncludedFilter)
      .pipe(plugins.data(getTemplateInputData))
      .pipe(plugins.twigUpToDate({
        base: path.join(config.src.base, config.src.templatesPath),
        functions: templatesFunctions({
          config: config,
          manifest: manifest
        }),
        errorLogToConsole: true
      }))
      .pipe(plugins.prettify({ indent_size: 2, preserve_newlines: true }))
      .pipe(gulp.dest(config.dest.base));
  }

  gulp.task('templates-watch', function() {
    return templates();
  });

  gulp.task('templates-build', function() {
    var manifest = JSON.parse(fs.readFileSync(
      path.join(config.dest.base, config.dest.revManifest), 'utf8'));
    return templates(manifest);
  });
};

module.exports = templatesTask;

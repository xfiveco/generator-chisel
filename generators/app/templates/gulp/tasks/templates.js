'use strict';

const fs = require('fs');
const path = require('path');
const templatesFunctions = require('../templatesFunctions');

module.exports = function templatesTask(gulp, plugins, config, helpers) {
  const { src, dest } = config;

  function getTemplateInputData(file) {
    let data;
    try {
      data = JSON.parse(
        fs.readFileSync(
          path.join(src.base, src.dataPath, `${path.basename(file.path)}.json`)
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
    const buildIncludedGlobs = src.templatesBuild || '';
    const buildIncludedFilter = plugins.filter(buildIncludedGlobs);

    return gulp
      .src(src.templatesWatch)
      .on('end', plugins.browserSync.reload)
      .pipe(plugins.plumber(helpers.onError))
      .pipe(buildIncludedFilter)
      .pipe(plugins.data(getTemplateInputData))
      .pipe(
        plugins.twig({
          base: path.join(src.base, src.templatesPath),
          functions: templatesFunctions({
            config,
            manifest,
          }),
          errorLogToConsole: true,
        })
      )
      .pipe(plugins.prettify({ indent_size: 2, preserve_newlines: true }))
      .pipe(gulp.dest(dest.base));
  }

  gulp.task('templates-watch', () => templates());

  gulp.task('templates-build', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(dest.base, dest.revManifest), 'utf8')
    );
    return templates(manifest);
  });
};

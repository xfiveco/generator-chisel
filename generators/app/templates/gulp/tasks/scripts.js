'use strict';

var path = require('path');

var scriptsTask = function (gulp, plugins, config, helpers) {
  function buildScript(watch) {
    var props = {
      entries: path.join(config.src.base, config.src.app),
      debug: true,
      <% if(features.has_babel) { %>
      transform: [["babelify", { "presets": ["es2015"] }]]
      <% } %>
    };

    var bundler = watch ? plugins.watchify(plugins.browserify(props)) : plugins.browserify(props);

    function rebundle() {
      var stream = bundler.bundle();

      if(watch) {
        return stream
          .on('error', helpers.onError)
          .pipe(plugins.vinylSourceStream('bundle.js'))
          .pipe(plugins.vinylBuffer())
          .pipe(plugins.sourcemaps.init({loadMaps: true}))
          .pipe(plugins.uglify())
          .pipe(plugins.sourcemaps.write('./'))
          .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
          .pipe(plugins.browserSync.stream());
      }

      return stream
        .pipe(plugins.vinylSourceStream('bundle.js'))
        .pipe(plugins.vinylBuffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(plugins.rev())
        .pipe(plugins.revReplace())
        .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
        .pipe(plugins.rev.manifest({
          path: path.join(config.dest.base, config.dest.revManifest),
          base: config.dest.base,
          merge: true
        }))
        .pipe(gulp.dest(config.dest.base));
    }

    bundler.on('update', rebundle);
    return rebundle();
  }

  gulp.task('scripts-build', () => buildScript(false));
  gulp.task('watchify', ['scripts-build'], () => buildScript(true));
};

module.exports = scriptsTask;

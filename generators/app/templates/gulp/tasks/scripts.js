'use strict';

var scriptsTask = function (gulp, plugins, config, helpers) {
  function buildScript(watch) {
    var props = {
      entries: config.src.app,
      debug: true,
      transform: [["babelify", { "presets": ["es2015"] }]]
    };

    var bundler = watch ? plugins.watchify(plugins.browserify(props)) : plugins.browserify(props);

    function rebundle() {
      var stream = bundler.bundle();
      return stream
        .on('error', helpers.onError)
        .pipe(plugins.vinylSourceStream('bundle.js'))
        .pipe(plugins.vinylBuffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest.scripts))
        .pipe(plugins.browserSync.stream());
    }

    bundler.on('update', () => {
      rebundle();
    })

    return rebundle();
  }

  gulp.task('scripts', () => {
      return buildScript(false);
  });

  gulp.task('watchify', ['scripts'], () => {
    return buildScript(true);
  });
};

module.exports = scriptsTask;

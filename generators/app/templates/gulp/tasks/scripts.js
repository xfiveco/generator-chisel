'use strict';

var scriptsTask = function (gulp, plugins, config, helpers) {

  var customOpts = {
    entries: config.src.app,
    debug: true
  };

  function bundle(bundler) {
    return bundler<% if (features.has_babel) { %>
      .transform("babelify", { presets: ["es2015"] })<% } %>
      .bundle()
      .pipe(plugins.vinylSourceStream('bundle.js'))
      .pipe(plugins.vinylBuffer())
      .pipe(plugins.sourcemaps.init({loadMaps: true}))
      .pipe(plugins.uglify())
      .on('error', helpers.onError)
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest(config.dest.scripts))
      .pipe(plugins.browserSync.stream());
  }

  gulp.task('scripts-build', ['lint', 'styles-build'], function () {
    return bundle(plugins.browserify(customOpts))
      .pipe(plugins.rev())
      .pipe(gulp.dest(config.dest.scripts))
      .pipe(plugins.rev.manifest({
        path: config.dest.revManifest,
        base: config.dest.base,
        merge: true
      }))
      .pipe(gulp.dest(config.dest.base));
  });

  gulp.task('watchify', function () {
    var watcher = plugins.watchify(plugins.browserify(customOpts, plugins.watchify.args));
    bundle(watcher);
    watcher.on('update', function () {
      bundle(watcher);
    })
  });
};

module.exports = scriptsTask;

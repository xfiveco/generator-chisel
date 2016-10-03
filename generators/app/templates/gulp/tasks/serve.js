'use strict';

var serveTask = function (gulp, plugins, config, helpers, generator_config) {
  gulp.task('serve', ['styles-watch', 'templates-watch', 'assets-watch'], function() {
    <% if(features.has_wp) { %>
    var name = generator_config.nameSlug;
    var browserSyncConfig = {
      proxy: name+'.dev',
      online: true
    }
    <% } else { %>
    var browserSyncConfig = {
      server: './',
      online: true
    }
    <% } %>
    plugins.browserSync.init(browserSyncConfig);

    gulp.watch(config.src.styles, ['styles-watch']);
    gulp.watch(config.src.templates, ['templates-watch']); // Build templates in front-end project
    gulp.watch(config.src.assets, ['assets-watch']);
    gulp.watch('*.php').on('change', plugins.browserSync.reload); // PHP files in WP projects
  });
};

module.exports = serveTask;

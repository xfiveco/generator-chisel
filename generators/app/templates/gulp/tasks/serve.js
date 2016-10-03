'use strict';

var serveTask = function (gulp, plugins, config) {
  gulp.task('serve', ['styles-watch', 'templates-watch', 'assets-watch'], function() {
    var browserSyncConfig = {
      server: './',
      online: true
    }
    <% if(features.has_wp) { %>
    delete browserSyncConfig.server;
    var yo = require('./../../.yo-rc.json');
    var name = yo['generator-chisel'].config.nameSlug;
    browserSyncConfig.proxy = name+'.dev';
    <% } %>
    plugins.browserSync.init(browserSyncConfig);

    gulp.watch(config.src.styles, ['styles-watch']);
    gulp.watch(config.src.templates, ['templates-watch']); // Build templates in front-end project
    gulp.watch(config.src.assets, ['assets-watch']);
    gulp.watch('*.php').on('change', plugins.browserSync.reload); // PHP files in WP projects
  });
};

module.exports = serveTask;

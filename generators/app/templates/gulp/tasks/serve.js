'use strict';

var path = require('path');

var serveTask = function (gulp, plugins, config, helpers, generator_config) {
  gulp.task('serve', ['styles-watch', 'templates-watch', 'assets-watch'], function() {
    <% if(projectType == 'wp-with-fe') { %>
    var name = generator_config.nameSlug;
    var browserSyncConfig = {
      proxy: {
        target: name+'.dev',
        reqHeaders: {
          'x-chisel-proxy': '1'
        }
      },
      online: true
    }
    <% } else { %>
    var browserSyncConfig = {
      server: './',
      online: true
    }
    <% } %>
    plugins.browserSync.init(browserSyncConfig);

    gulp.watch(path.join(config.src.base, config.src.styles), ['styles-watch']);
    gulp.watch(config.src.templatesWatch, ['templates-watch']);
    gulp.watch(path.join(config.src.base, config.src.assets), ['assets-watch']);
    <% if(projectType == 'wp-with-fe') { %>
    gulp.watch('**/*.{php,twig}').on('change', plugins.browserSync.reload);
    <% } %>
  });
};

module.exports = serveTask;

'use strict';

var path = require('path');

var serveTask = function (gulp, plugins, config, helpers, generator_config) {
  <% if(projectType == 'wp-with-fe') { %>
  var startTasks = ['styles-watch', 'assets-watch', 'vendor-watch'];
  <% } else { %>
  var startTasks = ['styles-watch', 'assets-watch', 'vendor-watch'];
  gulp.task('vendor-rebuild-template', ['vendor-watch'], function () {
    gulp.start('templates-watch');
  });
  <% } %>
  gulp.task('serve', startTasks, function() {
    <% if(projectType == 'wp-with-fe') { %>
    var name = generator_config.nameSlug;
    var browserSyncConfig = {
      proxy: {
        target: generator_config.proxyTarget || name+'.test',
        reqHeaders: {
          'x-chisel-proxy': '1'
        }
      },
      ghostMode: false,
      online: true
    }
    <% } else { %>
    gulp.start('templates-watch');

    var browserSyncConfig = {
      server: './',
      ghostMode: false,
      online: true
    }
    <% } %>
    plugins.browserSync.init(browserSyncConfig);

    gulp.watch(path.join(config.src.base, config.src.styles), ['styles-watch']);
    <% if(projectType == 'fe') { %>
    // TODO: rebuild templates when webpack manifest changes
    gulp.watch(config.src.templatesWatch, ['templates-watch']);
    gulp.watch(path.join(config.src.base, config.src.vendorConfig), ['vendor-rebuild-template']);
    <% } %>
    gulp.watch(path.join(config.src.base, config.src.assets), ['assets-watch']);
    <% if(projectType == 'wp-with-fe') { %>
    gulp.watch(config.src.templatesWatch).on('change', plugins.browserSync.reload);
    gulp.watch(path.join(config.src.base, config.src.vendorConfig), function () {
      gulp.start('vendor-watch', function () {
        plugins.browserSync.reload();
      });
    });
    <% } %>
  });
};

module.exports = serveTask;

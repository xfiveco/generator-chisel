'use strict';

const path = require('path');

// eslint-disable-next-line no-unused-vars
function serveTask(gulp, plugins, config, helpers, generatorConfig) {<% if(projectType == 'wp-with-fe') { %>
  const startTasks = ['styles-watch', 'assets-watch', 'vendor-watch'];<% } else { %>
  const startTasks = ['styles-watch', 'assets-watch', 'vendor-watch'];

  gulp.task('vendor-rebuild-template', ['vendor-watch'], () => {
    gulp.start('templates-watch');
  });<% } %>

  gulp.task('serve', startTasks, () => {<% if(projectType == 'wp-with-fe') { %>
    const name = generatorConfig.nameSlug;
    const browserSyncConfig = {
      proxy: {
        target: generatorConfig.proxyTarget || `${name}.test`,
        reqHeaders: {
          'x-chisel-proxy': '1',
        },
      },
      ghostMode: false,
      online: true,
    };<% } else { %>
    gulp.start('templates-watch');

    const browserSyncConfig = {
      server: './',
      ghostMode: false,
      online: true,
    };<% } %>

    plugins.browserSync.init(browserSyncConfig);

    gulp.watch(path.join(config.src.base, config.src.styles), ['styles-watch']);<% if(projectType == 'fe') { %>
    gulp.watch(config.src.templatesWatch, ['templates-watch']);
    gulp.watch(path.join(config.src.base, config.src.vendorConfig), [
      'vendor-rebuild-template'
    ]);<% } %>
    gulp.watch(path.join(config.src.base, config.src.assets), ['assets-watch']);<% if(projectType == 'wp-with-fe') { %>
    gulp
      .watch(config.src.templatesWatch)
      .on('change', plugins.browserSync.reload);
    gulp.watch(path.join(config.src.base, config.src.vendorConfig), () => {
      gulp.start('vendor-watch', () => {
        plugins.browserSync.reload();
      });
    });<% } %>
  });
}

module.exports = serveTask;

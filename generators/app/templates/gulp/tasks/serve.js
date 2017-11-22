'use strict';

const path = require('path');

module.exports = function serveTask(
  gulp,
  plugins,
  config,
  helpers,
  generatorConfig // eslint-disable-line no-unused-vars
) {
  const { base, styles, vendorConfig, assets, templatesWatch } = config.src;<% if(projectType == 'wp-with-fe') { %>
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

    gulp.watch(path.join(base, styles), ['styles-watch']);<% if(projectType == 'fe') { %>
    gulp.watch(templatesWatch, ['templates-watch']);
    gulp.watch(path.join(base, vendorConfig), ['vendor-rebuild-template']);<% } %>
    gulp.watch(path.join(base, assets), ['assets-watch']);<% if(projectType == 'wp-with-fe') { %>
    gulp.watch(templatesWatch).on('change', plugins.browserSync.reload);
    gulp.watch(path.join(base, vendorConfig), () => {
      gulp.start('vendor-watch', () => {
        plugins.browserSync.reload();
      });
    });<% } %>
  });
};

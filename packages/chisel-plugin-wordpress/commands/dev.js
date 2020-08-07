module.exports = (api, options) => {
  const { wordPress: hooks } = api.hooks;

  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const fs = require('fs-extra');

      api.chainWebpack((webpackConfig) => {
        webpackConfig
          .plugin('hot-module-replacement')
          .use(require('webpack/lib/HotModuleReplacementPlugin'));

        const hotPath = require.resolve('webpack-hot-middleware/client');
        const hotWithQuery = `${hotPath}?reload=true`;

        Object.values(webpackConfig.entryPoints.entries()).forEach((entry) => {
          entry.prepend(hotWithQuery);
        });
      });

      const browserSync = require('browser-sync');
      const webpack = require('webpack');
      const webpackDevMiddleware = require('webpack-dev-middleware');
      const webpackHotMiddleware = require('webpack-hot-middleware');

      process.env.NODE_ENV = 'development';

      const config = await api.service.resolveWebpackConfig();
      const compiler = webpack(config);
      const bs = browserSync.create();

      const { directoryName, themeName } = options.wp;

      const devMiddlewareOptions = {
        publicPath: `/wp-content/themes/${themeName}/dist`,
        stats: 'errors-warnings',
      };

      await hooks.devMiddlewareOptions.promise(devMiddlewareOptions);

      const devMiddleware = webpackDevMiddleware(
        compiler,
        devMiddlewareOptions,
      );

      const hotMiddlewareOptions = { log: false };

      await hooks.hotMiddlewareOptions.promise(hotMiddlewareOptions);

      const hotMiddleware = webpackHotMiddleware(
        compiler,
        hotMiddlewareOptions,
      );

      const browserSyncConfig = {
        proxy: {
          target: options.wp.url,
          reqHeaders: {
            'x-chisel-proxy': '1',
          },
        },
        ghostMode: false,
        online: true,
        middleware: [devMiddleware, hotMiddleware],
        port: parseInt(process.env.PORT, 10) || 3000,
      };

      await new Promise((resolve) => {
        devMiddleware.context.compiler.hooks.done.tap(
          'chisel-plugin-webpack',
          resolve,
        );
      });

      await hooks.browserSyncConfig.promise(browserSyncConfig);

      await new Promise((resolve) => {
        bs.init(browserSyncConfig, resolve);
      });

      const devManifestPath = api.resolve(
        options.output.base,
        'manifest-dev.json',
      );

      let watchReady = false;
      let fileManifestBody = '';
      const watcher = bs.watch(
        api.resolve(directoryName, 'wp-content/themes', themeName),
        (ev, file) => {
          // save initial content of manifest file
          if (!fileManifestBody && file === devManifestPath) {
            fs.readFile(file, { encoding: 'utf8' }).then((content) => {
              fileManifestBody = content;
            });
          }

          // don't reload before initialized
          if (!watchReady) return;

          // reload on changes in php and twig files
          if (file.endsWith('.php') || file.endsWith('.twig')) {
            bs.reload();
          }

          // detect changes in manifest (so changes in assets) and reload
          if (fileManifestBody && file === devManifestPath) {
            fs.readFile(file, { encoding: 'utf8' }).then((content) => {
              if (content !== fileManifestBody) {
                fileManifestBody = content;
                bs.reload();
              }
            });
          }
        },
      );

      watcher.on('ready', () => {
        watchReady = true;
      });

      return () => {
        bs.exit(); // no callback supported
        return Promise.all([
          new Promise((resolve) => {
            devMiddleware.close(resolve);
          }),
          watcher.close(),
        ]);
      };
    },
  );
};

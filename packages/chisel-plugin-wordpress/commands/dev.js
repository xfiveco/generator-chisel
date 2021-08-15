module.exports = (api, options) => {
  const { wordPress: hooks } = api.hooks;

  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const fs = require('fs-extra');
      const browserSync = require('browser-sync');
      const webpack = require('webpack');
      const { WebpackPluginServe } = require('webpack-plugin-serve');
      const { directoryName, themeName } = options.wp;

      process.env.NODE_ENV = 'development';
      const projectPort = parseInt(process.env.PORT, 10) || 3000;

      let config = await api.service.resolveWebpackConfig();

      config.output.hotUpdateChunkFilename = 'hot/hot-update.js';
      config.output.hotUpdateChunkFilename = 'hot/hot-update.json';

      const projectDevServerOptions = {
        host: 'localhost',
        port: projectPort,
        open: true,
        hmr: 'refresh-on-failure',
        status: true,
        progress: true,
        compress: true,
        client: {
          address: `127.0.0.1:${projectPort}`,
          retry: true,
          silent: true, // Change to false for debug
        },
      };

      console.log('WPS SERVE');

      const webpackPluginServe = new WebpackPluginServe(
        projectDevServerOptions,
      );

      config.plugins.push(webpackPluginServe);

      const bs = browserSync.create();

      const browserSyncConfig = {
        proxy: {
          target: options.wp.url,
          ws: true,
          reqHeaders: {
            'x-chisel-proxy': '1',
          },
        },
        ghostMode: false,
        online: true,
        open: false,
        port: projectPort
      };

      await hooks.browserSyncConfig.promise(browserSyncConfig);
      console.log('WPS PROMISE');

      await new Promise((resolve) => {
        bs.init(browserSyncConfig, resolve);
      });

      const devManifestPath = api.resolve(
        options.output.base,
        'manifest-dev.json',
      );

      console.log('WPS WATCH');

      const compiler = webpack(config, (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.log(stats.toString({ colors: true }));
          console.error(new Error('Build failed with errors.'));
          return;
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }
      });

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

      await new Promise((resolve) => {
        watcher.on('ready', () => {
          watchReady = true;
          resolve();
        });
      });

      return () => {
        bs.exit(); // no callback supported
        return Promise.all([
          watcher.close(),
        ]);
      };
    },
  );
};

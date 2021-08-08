module.exports = (api, options) => {
  const { wordPress: hooks } = api.hooks;

  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const fs = require('fs-extra');

      // api.chainWebpack((webpackConfig) => {
      //   // webpackConfig
      //   //   .plugin('hot-module-replacement')
      //   //   .use(require('webpack/lib/HotModuleReplacementPlugin'));

      //   // const hotPath = require.resolve('webpack-hot-middleware/client');
      //   // const hotWithQuery = `${hotPath}?reload=true`;

      //   // Object.values(webpackConfig.entryPoints.entries()).forEach((entry) => {
      //   //   entry.prepend(hotWithQuery);
      //   // });
      // });

      const browserSync = require('browser-sync');
      const webpack = require('webpack');
      const { WebpackPluginServe } = require('webpack-plugin-serve');
      // const webpackHotMiddleware = require('webpack-hot-middleware');

      process.env.NODE_ENV = 'development';

      let config = await api.service.resolveWebpackConfig();

      
      const { directoryName, themeName } = options.wp;
      config.output.publicPath = `/wp-content/themes/${themeName}/dist/`;
      console.log('config', config);

      const projectDevServerOptions = {
        host: 'localhost',
        port: 3000,
        open: true,
        hmr: 'refresh-on-failure',
        status: true,
        progress: false,
        compress: true,
        client: {
          address: 'localhost:3000',
          retry: true,
        },

        // ...config.devServer,

        // middleware: (app, builtins) => {
        //   // const glob = [
        //   //   `/wp-content/themes/${themeName}/dist/`,
        //   // ];
        //   // builtins.static(glob);

        //   app.use(
        //     builtins.proxy(`/wp-content/themes/${themeName}/dist/`, {
        //       target: options.wp.url,
        //       // pathRewrite: { '^/wp': '' }
        //     })
        //   );

        //   // app.use(async (ctx, next) => {
        //   //   await next();
        //   //   ctx.set('x-chisel-proxy', '1');
        //   // })
        // }
      };

      // await hooks.devMiddlewareOptions.promise(devMiddlewareOptions);

      projectDevServerOptions.port =
        Number(process.env.PORT) || projectDevServerOptions.port;

      console.log('WPS SERVE');

      const webpackPluginServe = new WebpackPluginServe(
        // compiler,
        projectDevServerOptions,
      );

      config.plugins.push(webpackPluginServe);

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
      const bs = browserSync.create();

      // const hotMiddlewareOptions = { log: false };

      // await hooks.hotMiddlewareOptions.promise(hotMiddlewareOptions);

      // const hotMiddleware = webpackHotMiddleware(
      //   compiler,
      //   hotMiddlewareOptions,
      // );

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
        // middleware: [hotMiddleware],
        // port: parseInt(process.env.PORT, 10) || 3000,
      };

      // await new Promise((resolve) => {
      //   devMiddleware.context.compiler.hooks.done.tap(
      //     'chisel-plugin-webpack',
      //     resolve,
      //   );
      // });

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
          new Promise((resolve) => {
            // devMiddleware.close(resolve);
          }),
          watcher.close(),
        ]);
      };
    },
  );
};

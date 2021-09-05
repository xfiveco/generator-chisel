const path = require('path');

module.exports = (api, options) => {
  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const fs = require('fs-extra');
      fs.remove(api.resolve(options.output.base)).catch((err) =>
        console.warn(err),
      );

      const webpack = require('webpack');
      const { WebpackPluginServe: Serve } = require('webpack-plugin-serve');
      const HtmlWebpackPlugin = require('html-webpack-plugin');
      const { debounce } = require('lodash');
      const { host } = require('chisel-shared-utils');

      process.env.NODE_ENV = 'development';

      const config = await api.service.resolveWebpackConfig();

      const outputPath = !options.staticFrontend.serveDist
        ? '\\'
        : config.output.path;

      const hostAddress = await host('0.0.0.0');

      const projectDevServerOptions = {
        host: hostAddress,
        port: 3000,
        open: true,
        hmr: 'refresh-on-failure',
        status: true,
        progress: false,
        compress: true,
        client: {
          address: `${hostAddress}:3000`,
          retry: true,
          silent: true, // Change to false for debug
        },
        static: [config.context, outputPath],

        ...config.devServer,
      };

      if (options.staticFrontend.skipHtmlExtension) {
        projectDevServerOptions['middleware'] = (app, builtins) =>
          app.use(async (ctx, next) => {
            // console.log('CTX', ctx);
            if (
              !ctx.request.url.endsWith('/') &&
              !ctx.request.url.includes('wps') &&
              !path.posix.extname(ctx.request.url)
            ) {
              ctx.request.url += '.html';
            }
            await next();
          });
      }

      projectDevServerOptions.port =
        Number(process.env.PORT) || projectDevServerOptions.port;

      const serve = new Serve(projectDevServerOptions);

      config.plugins.push(serve);

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

      const reloadDebounced = debounce(() => {
        serve.emit('reload');
      }, 100);

      compiler.hooks.compilation.tap(
        'chisel-plugin-static-frontend',
        (compilation) => {
          HtmlWebpackPlugin.getHooks(compilation).afterEmit.tap(
            'chisel-plugin-static-frontend',
            // eslint-disable-next-line no-unused-vars
            (data) => {
              // console.log(`Emit ${data.outputName}`);
              reloadDebounced();
            },
          );
        },
      );

      await new Promise((resolve) => {
        compiler.hooks.done.tap('chisel-plugin-static-frontend', resolve);
      });
    },
  );
};

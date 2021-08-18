const path = require('path');


module.exports = (api, options) => {
  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const fs = require('fs-extra');
      fs.remove(api.resolve(options.output.base))
      .catch((err) => console.warn(err));

      const webpack = require('webpack');
      const { WebpackPluginServe: Serve } = require('webpack-plugin-serve');

      process.env.NODE_ENV = 'development';

      const config = await api.service.resolveWebpackConfig();

      config.output.publicPath = options.staticFrontend.serveDist
        ? '/'
        : `/${options.output.base}/`;

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
          silent: true, // Change to false for debug
        },

        ...config.devServer,
      };

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

      // Calls with the each change
      compiler.hooks.invalid.tap('invalid', (fileName) => {
        if (fileName.endsWith('.twig')) {
          serve.emit('reload');
        }
      });
    },
  );
};

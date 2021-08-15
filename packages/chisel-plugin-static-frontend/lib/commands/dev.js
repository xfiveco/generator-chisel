const path = require('path');


const beforeAddHtmlExtension = (app) => {
  app.use((req, res, next) => {
    // console.log(req.url, req.headers);
    if (!req.url.endsWith('/') && !path.posix.extname(req.url)) {
      req.url += '.html';
    }
    next();
  });
};

module.exports = (api, options) => {
  api.registerCommand(
    'dev',
    (command) => command.description('start development server'),
    async () => {
      const webpack = require('webpack');
      const { WebpackPluginServe: Serve } = require('webpack-plugin-serve');
      const HtmlWebpackPlugin = require('html-webpack-plugin');

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
        },

        ...config.devServer,
      };


      if (options.staticFrontend.skipHtmlExtension) {
        const oldBefore = projectDevServerOptions.before;
        projectDevServerOptions.before = (...args) => {
          beforeAddHtmlExtension(...args);
          if (oldBefore) oldBefore(...args);
        };
      }

      projectDevServerOptions.port =
        Number(process.env.PORT) || projectDevServerOptions.port;

      const serve = new Serve(projectDevServerOptions);

      config.plugins.push(serve);

      console.log('config', config);
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

    },
  );
};

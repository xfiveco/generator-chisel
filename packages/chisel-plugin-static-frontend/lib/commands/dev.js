const path = require('path');

const defaults = {
  host: '0.0.0.0',
  port: 3000,
  https: false,
  hot: true,
  stats: 'errors-warnings',
  open: true,
  useLocalIp: true,
};

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
      const WebpackDevServer = require('webpack-dev-server');
      const HtmlWebpackPlugin = require('html-webpack-plugin');
      const { debounce } = require('lodash');

      process.env.NODE_ENV = 'development';

      const config = await api.service.resolveWebpackConfig();

      const projectDevServerOptions = {
        ...defaults,
        ...{
          publicPath: options.staticFrontend.serveDist
            ? '/'
            : `/${options.output.base}/`,
        },
        ...config.devServer,
        ...options.devServer,
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

      const compiler = webpack(config);

      const server = new WebpackDevServer(compiler, projectDevServerOptions);

      const reloadDebounced = debounce(() => {
        // console.log('reload');
        server.sockWrite(server.sockets, 'content-changed');
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

      server.listen(
        projectDevServerOptions.port,
        projectDevServerOptions.host,
        (err) => {
          if (err) throw err;
        },
      );
    },
  );
};

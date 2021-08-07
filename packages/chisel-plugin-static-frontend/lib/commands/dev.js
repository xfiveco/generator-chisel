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
      const { WebpackPluginServe: Serve } = require('webpack-plugin-serve');
      const HtmlWebpackPlugin = require('html-webpack-plugin');
      const { debounce } = require('lodash');
      const sane = require('sane');

      process.env.NODE_ENV = 'development';

      const config = await api.service.resolveWebpackConfig();

      console.log('SERVER DIST', options.staticFrontend.serveDist);
      console.log('OUTPUT BASE', options.output.base);

      config.output.publicPath =
        options.staticFrontend.serveDist
          ? '/'
          : `/${options.output.base}/`;

      const projectDevServerOptions = {
        host: 'localhost',
        port: 3000,
        open: true,
        hmr: true,
        status: true,
        progress: true,
        compress: true,
        client: {
          address: 'localhost:3000'
        },

        ...config.devServer,
        // ...options.devServer,
      };

      console.log('before watch');
      const watcher = sane(config.output.path);
      console.log('after watch');

      if (options.staticFrontend.skipHtmlExtension) {
        const oldBefore = projectDevServerOptions.before;
        projectDevServerOptions.before = (...args) => {
          beforeAddHtmlExtension(...args);
          if (oldBefore) oldBefore(...args);
        };
      }
      console.log('skip html');

      projectDevServerOptions.port =
        Number(process.env.PORT) || projectDevServerOptions.port;

      console.log('compiler');

      const compiler = webpack(config);

      console.log('after compiler');

      const serve = new Serve(projectDevServerOptions);
      serve.apply(compiler)

      
      config.plugins.push(serve);
      console.log('plugins', config);

      // const reloadDebounced = debounce(() => {
      //   // console.log('reload');
      //   serve.sockWrite(serve.client, 'content-changed');
      // }, 100);

      console.log('hooks');

      // compiler.hooks.compilation.tap(
      //   'chisel-plugin-static-frontend',
      //   (compilation) => {
      //     HtmlWebpackPlugin.getHooks(compilation).afterEmit.tap(
      //       'chisel-plugin-static-frontend',
      //       // eslint-disable-next-line no-unused-vars
      //       (data) => {
      //         console.log(`Emit ${data.outputName}`);
      //         // reloadDebounced();
      //       },
      //     );
      //   },
      // );

      console.log('promise');

      // await new Promise((resolve) => {
      //   console.log('start promise', resolve);
      //   compiler.hooks.done.tapAsync('chisel-plugin-static-frontend', resolve);
      // });

      console.log('listening');


      serve.on('listening', () => {
        console.log('onlistening')
        watcher.on('change', (filePath, root, stat) => {
          // console.log('stat', stat);
          serve.emit('reload', { source: 'config' });
        });
      });

      serve.on('close', () => watcher.close());


      // console.log('after listening', serve);

      const webpackWatcher = compiler.watch(config.watchOptions, (err, stats) => {
        // Gets called every time Webpack finishes recompiling.
      });

      // serve.listen(
      //   projectDevServerOptions.port,
      //   projectDevServerOptions.host,
      //   (err) => {
      //     if (err) throw err;
      //   },
      // );
    },
  );
};

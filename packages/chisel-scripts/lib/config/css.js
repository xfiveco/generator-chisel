module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const path = require('path');

    const isProd = process.env.NODE_ENV === 'production';
    const sourceMap = true;

    const sassLoaderOptions = {
      sourceMap,
      sassOptions: {
        indentedSyntax: false,
        includePaths: [api.resolve('node_modules')], // TODO: don't use?
        outputStyle: 'expanded',
      },
    };

    const postCssLoaderOptions = {
      sourceMap,
    };

    const cssLoaderOptions = {
      sourceMap,
      import: false,
    };

    const extractCssLoaderOptions = {
      // hmr: !isProd,
      publicPath: path.relative(
        api.resolve(path.join(options.source.base, options.source.styles)),
        api.resolve(options.source.base),
      ),
    };

    const assetsDir = api.resolve(
      path.join(options.source.base, options.source.assets),
    );

    // Note: thread loader cannot be used right now
    // https://github.com/webpack-contrib/thread-loader/issues/79

    const createCssLoader = (rule, test) => {
      // prettier-ignore
      return webpackConfig.module.rule(rule).test(test)
        .exclude
          .add(assetsDir)
          .end()
        .use('extract-css-loader')
          .loader(require('mini-css-extract-plugin').loader)
          .options(extractCssLoaderOptions)
          .end()
        .use('css-loader')
          .loader(require.resolve('css-loader'))
          .options(cssLoaderOptions)
          .end()
        .use('postcss-loader')
          .loader(require.resolve('postcss-loader'))
          .options(postCssLoaderOptions)
          .end()
    };

    createCssLoader('css', /\.css$/);

    // prettier-ignore
    createCssLoader('scss', /\.scss$/)
      .use('sass-loader')
        .loader(require.resolve('sass-loader'))
        .options(sassLoaderOptions)
        .end()
      .use('sass-glob-loader')
        .loader(require.resolve('../webpack-loaders/sass-glob-loader.js'))
        .end();

    webpackConfig
      .plugin('extract-css')
      .use(require('mini-css-extract-plugin'), [
        { filename: `[name]${isProd ? '.[contenthash:8]' : ''}.css` },
      ]);

    // webpackConfig.optimization
    //   .minimizer('css')
    //   .use(require.resolve('../webpack-plugins/OptimizeCssnanoPlugin'), [
    //     { sourceMap: true },
    //   ]);

    webpackConfig
    .plugin('minify-css')
    .use(require('css-minimizer-webpack-plugin'));

    if (isProd) {
      webpackConfig
        .plugin('style-only-entries')
        .use(require('webpack-remove-empty-scripts'), []);
    }
  });
};

module.exports = (api, options) => {
  api.chainWebpack(async (webpackConfig) => {
    const globby = require('globby');
    const path = require('path');

    const isProd = process.env.NODE_ENV === 'production';
    const {
      productionSourceMap = true,
      productionMinimize = true,
      react,
    } = options;

    if (isProd) {
      webpackConfig
        .mode('production')
        .devtool(productionSourceMap ? 'source-map' : false);

      if (!productionMinimize) {
        webpackConfig.optimization.minimize(false);
      }
    } else {
      webpackConfig.mode('development').devtool('cheap-module-eval-source-map');
    }

    const baseDir = api.resolve(options.source.base);

    webpackConfig.context(api.service.context);

    (
      await globby([
        path.join(baseDir, options.source.scripts, '*.js').replace(/\\/g, '/'),
        path.join(baseDir, options.source.styles, '*.scss').replace(/\\/g, '/'),
      ])
    )
      .map((p) => path.relative(api.service.context, p))
      .sort()
      .forEach((p) => {
        const ext = path.extname(p);
        const base = path.basename(p, ext);
        const isScript = ext !== '.scss';
        const outDir = options.output[!isScript ? 'styles' : 'scripts'];
        const name = `${outDir}/${base}`;
        const entry = webpackConfig.entry(name).add(`./${p}`);

        if (isScript) {
          if (react) {
            entry.prepend('react-hot-loader/patch');
          }
        }
      });

    const outScriptsDir = options.output.scripts;
    webpackConfig.output
      .path(api.resolve(options.output.base))
      .filename(`[name]${isProd ? '.[contenthash:8]' : ''}.js`)
      .chunkFilename(`${outScriptsDir}/[id].js`);

    // prettier-ignore
    webpackConfig.resolve
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .end()
      .alias
        .set('@@', api.resolve(options.source.base))
        .set('~~', api.resolve(options.source.base))
        .set('@', api.resolve(options.source.base, options.source.scripts))
        .set('~', api.resolve(options.source.base, options.source.scripts))
        .set('assets', api.resolve(options.source.base, options.source.assets))
        .set('~assets', api.resolve(options.source.base, options.source.assets));

    if (react) {
      if (!isProd) {
        webpackConfig.resolve.alias.set('react-dom', '@hot-loader/react-dom');
      }
    }

    const fileLoaderOptions = {
      name(p) {
        const relative = path.relative(
          path.join(baseDir, options.source.assets),
          path.dirname(p),
        );

        if (!relative) {
          return `${options.output.assets}/[name].[hash:8].[ext]`;
        }

        return `${options.output.assets}/[folder]/[name].[hash:8].[ext]`;
      },
    };

    const urlLoaderOptions = {
      generator(content, mimetype, encoding, resourcePath) {
        if (resourcePath.endsWith('.svg')) {
          return require('mini-svg-data-uri')(content.toString());
        }

        return `data:${mimetype}${
          encoding ? `;${encoding}` : ''
        },${content.toString(encoding || undefined)}`;
      },
    };

    // prettier-ignore
    webpackConfig.module
      .rule('assets')
        .include
          .add(api.resolve(path.join(baseDir, options.source.assets)))
          .end()
        .oneOf('inline')
          .resourceQuery(/inline/)
          .use('url')
            .loader('url-loader')
            .options(urlLoaderOptions)
            .end()
          .end()
        .oneOf('external')
          .use('file-loader')
            .loader(require.resolve('file-loader'))
            .options(fileLoaderOptions)

    // prettier-ignore
    webpackConfig.resolveLoader
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))

    webpackConfig
      .plugin('case-sensitive-paths')
      .use(require('case-sensitive-paths-webpack-plugin'));

    webpackConfig
      .plugin('chisel-dynamic-public-path')
      .use(require('../webpack-plugins/DynamicPublicPath'));

    webpackConfig.plugin('webpackbar').use(require('webpackbar'));

    if (isProd) {
      // keep chunk ids stable so async chunks have consistent hash (#1916)
      webpackConfig
        .plugin('named-chunks')
        .use(require('webpack/lib/NamedChunksPlugin'), [
          (chunk) => {
            if (chunk.name) {
              return chunk.name;
            }

            const hash = require('hash-sum');
            const joinedHash = hash(
              Array.from(chunk.modulesIterable, (m) => m.id).join('_'),
            );
            return `chunk-${joinedHash}`;
          },
        ]);

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
        .use(require('webpack/lib/HashedModuleIdsPlugin'), [
          { hashDigest: 'hex' },
        ]);

      if (productionMinimize) {
        webpackConfig
          .plugin('unminified-webpack-plugin')
          .use(require('unminified-webpack-plugin'), [{ postfix: 'full' }]);
      }
    }
  });
};

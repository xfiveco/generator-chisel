// This webpack configuration is meant to be used by Chisel build scripts.
// It should not be used with Webpack CLI.

'use strict';

const webpack = require('webpack');
const path = require('path');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const NameAllModulesPlugin = require('./gulp/NameAllModulesPlugin');

function createConfig(cb) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const config = {
    output: {
      filename: '[id].bundle.js',
      chunkFilename: '[id].chunk.js',
    },
    externals: {<% if (has_jquery_vendor_config) { %>
      jquery: 'window.jQuery',
    <% } %>},
    devtool: 'inline-source-map',
    stats: { colors: true, modules: false },
    watch: isDevelopment,
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      ],
    },
    node: false,
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NamedChunksPlugin(chunk => {
        if (chunk.name) {
          return chunk.name;
        }
        return `${chunk
          .mapModules(module => {
            const file = path.relative(module.context, module.request);
            return `${path.basename(file, path.extname(file))}-${module.id}`;
          })
          .join('_')}.c`;
      }),
      new NameAllModulesPlugin(),
      new ChunkManifestPlugin({
        filename: `manifest${!isProduction ? '-dev' : ''}.json`,
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  };

  cb(config);
}

module.exports = () =>
  new Promise(resolve => {
    createConfig(resolve);
  });
